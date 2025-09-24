#!/usr/bin/env python3
import json
import argparse
import subprocess
from datetime import datetime

SERVER_CHOSEN = "local" # local, nucubuntunl or aleutheris
SERVER_MODE = "dev"  # dev or prod

PRESERVED_FOLDER = "/node_modules"
DATE_FORMAT = "%Y-%m-%d %H:%M:%S"


def run_command(command):
    print(f"Running command: {' '.join(command)}")
    process = subprocess.Popen(command, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)

    while True:
        stdout_line = process.stdout.readline()
        stderr_line = process.stderr.readline()

        if stdout_line == '' and stderr_line == '' and process.poll() is not None:
            break

        if stdout_line:
            print(f"STDOUT: {stdout_line.strip()}")

        if stderr_line:
            print(f"STDERR: {stderr_line.strip()}")

    # Wait for the process to complete
    process.wait()

    if process.returncode != 0:
        print(f"Command failed with return code {process.returncode}")

    print("\n")


def get_container_ids_by_tag(project_tag, server_address=None):
    if server_address:
        command = ["ssh", server_address, "docker", "ps", "-a", "--filter", f"ancestor={project_tag}", "--format", "{{.ID}}"]
    else:
        command = ["docker", "ps", "-a", "--filter", f"ancestor={project_tag}", "--format", "{{.ID}}"]

    try:
        result = subprocess.run(
            command, capture_output=True, text=True, check=True
        )

        container_ids = result.stdout.strip().split('\n')
        return container_ids

    except subprocess.CalledProcessError as e:
        print("Error running docker command:", e)
        return []


def get_image_ids_by_tag(project_tag, server_address=None):
    if server_address:
        command = ["ssh", server_address, "docker", "images", project_tag, "-q"]
    else:
        command = ["docker", "images", project_tag, "-q"]

    try:
        result = subprocess.run(
            command, capture_output=True, text=True, check=True
        )

        image_ids = result.stdout.strip().split('\n')
        return image_ids

    except subprocess.CalledProcessError as e:
        print("Error running docker command:", e)
        return []

def edit_dockercompose(file_path, args):
    image = args["image"]
    ports = args["ports"]

    with open(file_path, 'r') as file:
        lines = file.readlines()

    with open(file_path, 'w') as file:
        i = 0
        while i < len(lines):
            line = lines[i]
            stripped = line.strip()

            # Handle image line
            if stripped.startswith('image:'):
                indent = line[:line.index('image:')]
                file.write(f"{indent}image: {image}\n")
                i += 1

            # Handle ports section
            elif stripped.startswith('ports:'):
                indent = line[:line.index('ports:')]
                file.write(f"{indent}ports:\n")

                # Skip existing port entries
                i += 1
                while i < len(lines) and (lines[i].strip().startswith('-') or lines[i].strip() == ''):
                    i += 1

                # Write new ports
                for port in ports:
                    file.write(f"{indent}  - \"{port}\"\n")

                # Don't increment i here since we already advanced it
                continue

            else:
                file.write(line)
                i += 1


def update_proxy_config(deploy_config, server_chosen, server_mode):
    """Update the proxy configuration file with the specified server settings."""
    proxy_config = {
        "/api": {
            "target": deploy_config['servers'][server_chosen]['proxy'][server_mode]['target'],
            "secure": deploy_config['servers'][server_chosen]['proxy'][server_mode]['secure']
        }
    }

    with open("src/proxy.conf.json", "w") as proxy_file:
        json.dump(proxy_config, proxy_file, indent=2)


def cleanup_local_containers_and_images(project_name, tag):
    """Stop and remove existing containers and images locally."""
    local_container_ids = get_container_ids_by_tag(project_name + ":" + tag)
    local_image_ids = get_image_ids_by_tag(project_name + ":" + tag)

    # Stop local containers
    if local_container_ids != ['']:
        run_command(["docker", "stop"] + local_container_ids)

    # Remove local containers
    if local_container_ids != ['']:
        run_command(["docker", "rm"] + local_container_ids)

    # Remove local images
    if local_image_ids != ['']:
        run_command(["docker", "rmi", "-f"] + local_image_ids)


def cleanup_server_containers_and_images(project_name, tag, server_address):
    """Stop and remove existing containers and images on the server."""
    server_container_ids = get_container_ids_by_tag(project_name + ":" + tag, server_address=server_address)
    server_image_ids = get_image_ids_by_tag(project_name + ":" + tag, server_address=server_address)

    # Stop server containers
    if server_container_ids != ['']:
        run_command(["ssh", server_address, "docker", "stop"] + server_container_ids)

    # Remove server containers
    if server_container_ids != ['']:
        run_command(["ssh", server_address, "docker", "rm"] + server_container_ids)

    # Remove server images
    if server_image_ids != ['']:
        run_command(["ssh", server_address, "docker", "rmi", "-f", project_name + ":" + tag])


def deploy_to_local(deploy_config):
    """Deploy the application locally using Docker."""
    print("Deploying locally...")

    update_proxy_config(deploy_config, SERVER_CHOSEN, SERVER_MODE)

    edit_dockercompose("docker-compose.yml", {
        "image": deploy_config["project"]["name"] + ":" + deploy_config["project"]["tag"][SERVER_MODE],
        "ports": deploy_config["servers"][SERVER_CHOSEN]["ports"][SERVER_MODE]
    })

    tag = deploy_config["project"]["tag"][SERVER_MODE]
    project_name = deploy_config["project"]["name"]

    # Clean up local containers and images
    cleanup_local_containers_and_images(project_name, tag)

    # Build the Docker image
    run_command(["docker", "build", "--target", SERVER_MODE, "-t", project_name + ":" + tag, "."])

    # Start the container using docker-compose
    run_command(["docker-compose", "up", "-d"])

    # Show local images
    run_command(["docker", "images"])


def deploy_to_server(deploy_config):
    """Deploy the application to a remote server."""
    print("Deploying to server...")

    update_proxy_config(deploy_config, SERVER_CHOSEN, SERVER_MODE)

    edit_dockercompose("docker-compose.yml", {
        "image": deploy_config["project"]["name"] + ":" + deploy_config["project"]["tag"][SERVER_MODE],
        "ports": deploy_config["servers"][SERVER_CHOSEN]["ports"][SERVER_MODE]
    })

    tag = deploy_config["project"]["tag"][SERVER_MODE]
    local_home_dir = deploy_config["local"]["home_dir"]

    server_address = deploy_config["servers"][SERVER_CHOSEN]["address"]
    server_home_dir = deploy_config["servers"][SERVER_CHOSEN]["home_dir"]

    project_name = deploy_config["project"]["name"]

    # Sync docker-compose file to server
    run_command(["rsync", "-avz", "-e", "ssh", "./docker-compose.yml", server_address + ":~/containers/" + project_name + "/"])

    # Clean up both local and server containers/images
    cleanup_local_containers_and_images(project_name, tag)
    cleanup_server_containers_and_images(project_name, tag, server_address)

    # Build the Docker image locally
    run_command(["docker", "build", "--target", SERVER_MODE, "-t", project_name + ":" + tag, "."])

    # Save and transfer the image to server
    run_command(["docker", "save", "-o", local_home_dir + "/" + project_name + ".tar", project_name])
    run_command(["scp", local_home_dir + "/" + project_name + ".tar", server_address + ":" + server_home_dir])
    run_command(["rm", local_home_dir + "/" + project_name + ".tar"])

    # Load image on server and start container
    run_command(["ssh", server_address, "docker", "load", "-i", server_home_dir + "/" + project_name + ".tar"])
    run_command(["ssh", server_address, "cd ~/containers/" + project_name + " && docker-compose", "up", "-d"])

    # Show images on both local and server
    run_command(["docker", "images"])
    run_command(["ssh", server_address, "docker", "images"])


def main():
    with open("deploy_config.json") as f:
        deploy_config = json.load(f)

    parser = argparse.ArgumentParser()
    parser.add_argument("-c", "--container", action="store_false", dest="silent", help="Disable standard output")
    args = parser.parse_args()

    if not args.silent:
        if SERVER_CHOSEN == "local":
            deploy_to_local(deploy_config)
        else:
            deploy_to_server(deploy_config)


if __name__ == "__main__":
    main()
