import os
import sys
import json
import base64
import urllib.request
import urllib.error

# Force UTF-8 output so emoji/symbols work on Windows terminals
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8')

def make_request(url, method, headers, data=None):
    req = urllib.request.Request(url, method=method, headers=headers)
    if data:
        req.data = json.dumps(data).encode('utf-8')
    try:
        with urllib.request.urlopen(req) as response:
            return response.status, json.loads(response.read().decode('utf-8'))
    except urllib.error.HTTPError as e:
        err_msg = e.read().decode('utf-8')
        try:
            err_json = json.loads(err_msg)
            return e.code, err_json
        except:
            return e.code, {"message": err_msg}
    except Exception as e:
        return 500, {"message": str(e)}

def main():
    print("="*60)
    print("      SHANMUKHA FASHIONS - AUTOMATED DEPLOYMENT TOOL")
    print("="*60)
    
    # 1. Gather Tokens
    github_token = os.environ.get('GITHUB_TOKEN', '').strip() or input("Enter GitHub Personal Access Token (PAT): ").strip()
    if not github_token:
        print("GitHub token is required.")
        return
        
    github_username = os.environ.get('GITHUB_USERNAME', '').strip() or input("Enter GitHub Username: ").strip()
    if not github_username:
        print("GitHub username is required.")
        return

    render_token = os.environ.get('RENDER_TOKEN', '').strip() or input("Enter Render API Token: ").strip()
    if not render_token:
        print("Render API token is required.")
        return

    repo_name = "public"
    
    # 2. Create Github Repo
    print("\n[1/3] Checking if GitHub Repository exists...")
    gh_headers = {
        "Authorization": f"token {github_token}",
        "Accept": "application/vnd.github.v3+json",
        "Content-Type": "application/json"
    }
    
    check_status, check_res = make_request(f"https://api.github.com/repos/{github_username}/{repo_name}", "GET", gh_headers)
    if check_status == 200:
        print(f"ℹ Repository '{repo_name}' already exists on GitHub. Proceeding with update...")
    else:
        print(f"ℹ Repository '{repo_name}' does not exist. Attempting to create it...")
        repo_data = {
            "name": repo_name,
            "description": "Full-Stack Shanmukha Fashions Web Application",
            "private": True,
            "auto_init": False
        }
        status, res = make_request("https://api.github.com/user/repos", "POST", gh_headers, repo_data)
        if status in [200, 201]:
            print(f"✓ Repository '{repo_name}' created successfully on GitHub!")
        elif status == 422 and "already exists" in str(res):
            print(f"ℹ Repository '{repo_name}' already exists on GitHub. Proceeding with update...")
        else:
            print(f"✗ Failed to create GitHub repository. Status: {status}, Error: {res.get('message')}")
            print("ℹ Try creating a private repository manually on GitHub (https://github.com/new) with the name 'shanmukha-fashions', then run the deploy script again.")
            return

    # 3. Upload files to Github using REST API (bypassing local git)
    print("\n[2/3] Uploading project files to GitHub (Bypassing local Git)...")
    files_to_upload = [
        ".gitignore",
        "app.py",
        "templates/index.html",
        "static/app.js",
        "static/style.css",
        "requirements.txt",
        "render.yaml",
        "Dockerfile",
        "static/logo.png"
    ]
    
    for filename in files_to_upload:
        if not os.path.exists(filename):
            print(f"⚠ Warning: File '{filename}' not found. Skipping...")
            continue
            
        print(f" -> Uploading {filename}...")
        
        # Read file contents and base64 encode it
        with open(filename, 'rb') as f:
            content = base64.b64encode(f.read()).decode('utf-8')
            
        upload_url = f"https://api.github.com/repos/{github_username}/{repo_name}/contents/{filename}"
        
        # Check if file already exists to get its SHA (needed for updates)
        sha = None
        get_status, get_res = make_request(upload_url, "GET", gh_headers)
        if get_status == 200:
            sha = get_res.get('sha')
            
        upload_data = {
            "message": f"upload {filename} via deploy script",
            "content": content
        }
        if sha:
            upload_data["sha"] = sha
            
        up_status, up_res = make_request(upload_url, "PUT", gh_headers, upload_data)
        if up_status in [200, 201]:
            print(f"   ✓ {filename} uploaded successfully!")
        else:
            print(f"   ✗ Failed to upload {filename}. Error: {up_res.get('message')}")
            return

    # 4. Deploy to Render
    print("\n[3/3] Deploying Web Service to Render.com...")
    render_headers = {
        "Authorization": f"Bearer {render_token}",
        "Accept": "application/json",
        "Content-Type": "application/json"
    }
    
    # Programmatically fetch Owner/Workspace ID
    print(" -> Retrieving Render owner/workspace ID...")
    owners_status, owners_res = make_request("https://api.render.com/v1/owners", "GET", render_headers)
    if owners_status != 200 or not owners_res:
        print(f"Failed to retrieve Render owner ID. Status: {owners_status}, Error: {owners_res}")
        return
    
    try:
        owner_id = owners_res[0]['owner']['id']
        print(f"   Owner ID: {owner_id}")
    except Exception as e:
        print(f"Failed to parse Owner ID from response: {str(e)}")
        return
    
    # Check if service already exists by listing services and looking for our name
    print(" -> Checking for existing 'shanmukha-fashions' service...")
    svc_list_status, svc_list_res = make_request(
        f"https://api.render.com/v1/services?ownerId={owner_id}&limit=50", "GET", render_headers
    )
    
    existing_service_id = None
    existing_service_url = None
    if svc_list_status == 200 and isinstance(svc_list_res, list):
        for entry in svc_list_res:
            svc = entry.get('service', entry)
            if svc.get('name') == 'shanmukha-fashions':
                existing_service_id = svc.get('id')
                existing_service_url = svc.get('serviceDetails', {}).get('url') or svc.get('url')
                break
    
    if existing_service_id:
        # Service already exists -> trigger a new deploy
        print(f"   Found existing service: {existing_service_id}")
        
        print(" -> Updating environment variables with secure keys...")
        import secrets
        import string
        alphabet = string.ascii_letters + string.digits
        new_secret = ''.join(secrets.choice(alphabet) for i in range(32))
        admin_pass = "shanmukha2026" # Default but secure via env
        
        env_vars_payload = [
            {"key": "PYTHON_VERSION", "value": "3.11.5"},
            {"key": "FLASK_DEBUG", "value": "false"},
            {"key": "SECRET_KEY", "value": new_secret},
            {"key": "ADMIN_PASSWORD", "value": admin_pass}
        ]
        
        env_status, env_res = make_request(
            f"https://api.render.com/v1/services/{existing_service_id}/env-vars",
            "PUT", render_headers,
            env_vars_payload
        )
        
        if env_status in [200, 201]:
            print("   ✓ Secure Environment Variables (SECRET_KEY, ADMIN_PASSWORD) injected successfully.")
        else:
            print(f"   ⚠ Failed to update env vars. Status: {env_status}, Error: {env_res}")

        print(" -> Triggering redeploy on existing service...")
        dep_status, dep_res = make_request(
            f"https://api.render.com/v1/services/{existing_service_id}/deploys",
            "POST", render_headers,
            {"clearCache": "do_not_clear"}
        )
        if dep_status in [200, 201]:
            print("\n" + "="*60)
            print("SUCCESS! New deployment triggered on Render!")
            print("="*60)
            print(f"Service ID : {existing_service_id}")
            print(f"Live URL   : {existing_service_url or 'https://shanmukha-fashions.onrender.com'}")
            print(f"Deploy ID  : {dep_res.get('id', 'N/A')}")
            print(f"Status     : {dep_res.get('status', 'in_progress')}")
            print(f"Admin Pass : {admin_pass}  <-- USE THIS TO LOG IN")
            print("Render will build and deploy in ~2-3 minutes.")
            print("Dashboard  : https://dashboard.render.com")
            print("="*60)
        else:
            print(f"\nFailed to trigger redeploy. Status: {dep_status}")
            print(f"Error: {dep_res}")
    else:
        print(" -> No existing service found. Creating new Render web service...")
        
        import secrets
        import string
        alphabet = string.ascii_letters + string.digits
        new_secret = ''.join(secrets.choice(alphabet) for i in range(32))
        admin_pass = "shanmukha2026"

        service_data = {
            "ownerId": owner_id,
            "name": "shanmukha-fashions",
            "type": "web_service",
            "repo": f"https://github.com/{github_username}/{repo_name}",
            "branch": "main",
            "autoDeploy": "yes",
            "envVars": [
                {"key": "PYTHON_VERSION", "value": "3.11.5"},
                {"key": "FLASK_DEBUG", "value": "false"},
                {"key": "SECRET_KEY", "value": new_secret},
                {"key": "ADMIN_PASSWORD", "value": admin_pass}
            ],
            "serviceDetails": {
                "runtime": "python",
                "plan": "free",
                "envSpecificDetails": {
                    "buildCommand": "pip install -r requirements.txt",
                    "startCommand": "gunicorn app:app"
                }
            }
        }
        
        render_status, render_res = make_request("https://api.render.com/v1/services", "POST", render_headers, service_data)
        if render_status in [200, 201]:
            print("\n" + "="*60)
            print("SUCCESS! SHANMUKHA FASHIONS DEPLOYED LIVE TO THE CLOUD!")
            print("="*60)
            print(f"Live URL: {render_res.get('service', {}).get('serviceDetails', {}).get('url', 'Check dashboard')}")
            print(f"Admin Pass: {admin_pass}  <-- USE THIS TO LOG IN")
            print("Dashboard: https://dashboard.render.com")
            print("Note: The initial build might take 2-3 minutes to complete.")
            print("="*60)
        else:
            print(f"\nFailed to create Render Web Service. Status: {render_status}")
            print(f"Error: {render_res.get('message', render_res)}")

if __name__ == '__main__':
    main()
