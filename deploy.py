import os
import sys
import json
import base64
import urllib.request
import urllib.error

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
    github_token = input("Enter GitHub Personal Access Token (PAT): ").strip()
    if not github_token:
        print("GitHub token is required.")
        return
        
    github_username = input("Enter GitHub Username: ").strip()
    if not github_username:
        print("GitHub username is required.")
        return

    render_token = input("Enter Render API Token: ").strip()
    if not render_token:
        print("Render API token is required.")
        return

    repo_name = "shanmukha-fashions"
    
    # 2. Create Github Repo
    print("\n[1/3] Creating GitHub Repository...")
    gh_headers = {
        "Authorization": f"token {github_token}",
        "Accept": "application/vnd.github.v3+json",
        "Content-Type": "application/json"
    }
    
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
        return

    # 3. Upload files to Github using REST API (bypassing local git)
    print("\n[2/3] Uploading project files to GitHub (Bypassing local Git)...")
    files_to_upload = [
        "app.py",
        "index.html",
        "app.js",
        "style.css",
        "requirements.txt",
        "render.yaml",
        "Dockerfile",
        "logo.png"
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

    # 4. Create Render Web Service
    print("\n[3/3] Deploying Web Service to Render.com...")
    render_headers = {
        "Authorization": f"Bearer {render_token}",
        "Accept": "application/json",
        "Content-Type": "application/json"
    }
    
    service_data = {
        "name": "shanmukha-fashions",
        "type": "web_service",
        "repo": f"https://github.com/{github_username}/{repo_name}",
        "env": "python",
        "branch": "main",
        "autoDeploy": "yes",
        "serviceDetails": {
            "env": "python",
            "buildCommand": "pip install -r requirements.txt",
            "startCommand": "gunicorn app:app",
            "plan": "starter",
            "disk": {
                "name": "sqlite-data",
                "mountPath": "/data",
                "sizeGB": 1
            }
        }
    }
    
    render_status, render_res = make_request("https://api.render.com/v1/services", "POST", render_headers, service_data)
    if render_status in [200, 201]:
        print("\n" + "="*60)
        print("🎉 SUCCESS! SHANMUKHA FASHIONS DEPLOYED LIVE TO THE CLOUD!")
        print("="*60)
        print(f"Live URL: {render_res.get('url')}")
        print("Dashboard Link: https://dashboard.render.com")
        print("Note: The initial build might take a minute or two to complete.")
        print("="*60)
    else:
        print(f"\n✗ Failed to create Render Web Service. Status: {render_status}")
        print(f"Error Message: {render_res.get('message', render_res)}")
        print("\nℹ Tip: If the name 'shanmukha-fashions' is already claimed, you may need to rename it in render.yaml.")

if __name__ == '__main__':
    main()
