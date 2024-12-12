# eDB

## Table of Contents

-   [Project Overview](#project-overview)
-   [Setup](#setup)
    -   [Frontend](#frontend)
        -   [Platform Application Features](#platform-application-features)
        -   [Shared Libraries](#shared-libraries)
        -   [Storybook](#storybook)
    -   [Backend](#backend)
    -   [Database](#database)
-   [Infrastructure](#infrastructure)
-   [Architecture](#architecture)

    -   [Development environment](#development-environment)
        -   [Development environment prerequisites](#development-environment-prerequisites)
        -   [Development environment diagram](#development-environment-diagram)
        -   [Spinning up a cluster on your local machine](#spinning-up-a-cluster-on-your-local-machine)
            -   [Step 1: Create and start a k3d cluster](#step-1-create-and-start-a-k3d-cluster)
            -   [Step 2: Create Dockerfiles for Your Services](#step-2-create-dockerfiles-for-your-services)
            -   [Step 3: Create Kubernetes Manifests](#step-3-create-kubernetes-manifests)
            -   [Step 4: Run Skaffold for Local Development](#step-4-run-skaffold-for-local-development)
    -   [Production environment](#production-environment)
        -   [CI/CD Pipeline](#cicd-pipeline)
    -   [Nx and Angular architecture](#nx-and-angular-architecture)
    -   [.NET architecture](#net-architecture)

-   [K3s Handy Commands Cheat Sheet](#k3s-handy-commands-cheat-sheet)
    -   [General Commands](#general-commands)
    -   [Database Management Commands](#database-management-commands)

---

## Project Overview

This is a platform for showcasing a range of applications.

---

## Setup

-   **Frontend**:

    -   **Tools**: **Angular 18**, managed within an **Nx** workspace.
    -   **Platform Application Features**:
        -   **User Management**:
            -   Login and registration.
            -   Profile updates, account deletion, and preference management.
        -   **Role-Based Access Control (RBAC)**:
            -   User roles: User, Premium User, Admin.
            -   Conditional access to sub-applications based on roles and feature flags (to be implemented).
        -   **Application Modularity**:
            -   Lazy-loading sub-applications for improved performance and scalability.
        -   **API Integration**:
            -   Utilizes **TanStack Query** to efficiently fetch and manage data from the backend REST API.
    -   **Shared Libraries**:
        -   **UI Library**:
            -   Built using **Carbon Design System**.
            -   Provides reusable components such as buttons, modals, and input fields to ensure consistent design across applications.
        -   **Utils Library**:
            -   Contains shared utility functions, services, and helpers to promote DRY (Don't Repeat Yourself) principles.
    -   **Storybook**:
        -   Used to document and visually test components from the shared UI library, ensuring consistency and reusability across the platform.

-   **Backend**:

    -   **Tools**: .NET 7 with Entity Framework.
    -   **Features**: REST API for platform services, user management, and role-based access.

-   **Database**: PostgreSQL

---

## Infrastructure

-   **Docker**: Manages containerized versions of the frontend, backend, and database.
-   **Kubernetes (K3s)**: Provides container orchestration for scalable application deployment.
    -   **kubectl**: Command-line tool for managing Kubernetes resources.
    -   **K3d**: Manages K3s clusters within Docker for lightweight local clusters.
    -   **Skaffold**: Handles continuous development workflows with Kubernetes.

---

## Architecture

### Development environment

#### Development environment architecture

I am using **k3d**, which wraps my **k3s** Kubernetes distribution inside **Docker** containers. **k3s** is a lightweight Kubernetes distribution that allows me to orchestrate containers for scalable application deployment. I use **Skaffold** to manage my Kubernetes manifests, build Docker images and deploy them to my local k3d cluster. Skaffold also pulls any configured images, such as **PostgreSQL** and **Adminer**, enabling a complete local development environment.

---

#### Development environment prerequisites

If you want to run this project locally, make sure you have the following installed:

1. **Docker**:  
   Download and install Docker from [https://www.docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop).

2. **k3d**:  
   Install k3d, a lightweight wrapper for running k3s in Docker.  
   Installation guide: [https://k3d.io/#installation](https://k3d.io/#installation)

    For example, using `brew` on macOS:

    ```bash
    brew install k3d
    ```

3. **kubectl**:  
   Install `kubectl`, the Kubernetes CLI tool, to manage the cluster.  
   Installation guide: [https://kubernetes.io/docs/tasks/tools/](https://kubernetes.io/docs/tasks/tools/)

4. **Skaffold**:  
   Download and install Skaffold for managing Kubernetes manifests and local development.  
   Installation guide: [https://skaffold.dev/docs/install/](https://skaffold.dev/docs/install/)

    For example, using `brew` on macOS:

    ```bash
    brew install skaffold
    ```

---

### Development Environment Diagram

![Development Setup Diagram](./diagrams/images/devopsv3.png)

---

#### Spinning up a cluster on your local machine

##### Step 1: Create and start a k3d cluster

Create a new k3d cluster and specify ports to expose the services running inside the cluster. These ports will be accessible from your host machine.

**Command to create the cluster:**

```bash
k3d cluster create mycluster --port "4200:4200@loadbalancer" --port "9101:9101@loadbalancer"
```

**Command to start the cluster:**

```bash
k3d cluster start mycluster
```

---

##### Step 2: Create Dockerfiles for Your Services

Create a `Dockerfile` for each service (e.g., `frontend` and `backend`).

##### Step 3: Create Kubernetes Manifests

Create Kubernetes manifests for all resources required by your application. These should include:

-   **Deployments**: Define how your frontend and backend applications will run, including resource limits and replicas.
-   **Services**: Expose your applications as `ClusterIP` or `LoadBalancer` types.
-   **ConfigMaps**: Store environment variables and other configurations.
-   **Secrets**: Store sensitive data securely (e.g., database credentials).
-   **Persistent Volumes (PVs) and Persistent Volume Claims (PVCs)**: Handle storage for services like PostgreSQL.

Ensure your manifests include the necessary annotations to work with k3d's local LoadBalancer and any ingress controllers you may use.

---

##### Step 4: Run Skaffold for Local Development

Use **Skaffold** to build and deploy your services automatically:

**Command:**

```bash
skaffold dev
```

This command will:

-   Build Docker images using your `Dockerfiles`.
-   Apply your Kubernetes manifests to the cluster.
-   Monitor your source code for changes and redeploy the services when updates are detected.

Once deployed, your frontend will be available at `http://localhost:4200` and your backend at `http://localhost:9101`. You can access these services via a browser or tools like Postman.

---

### Production environment

#### CI/CD Pipeline

##### Introduction

This CI/CD pipeline is designed to automate the process of building, validating, and deploying applications to a **Hetzner CAX21 VPS** running a **k3s cluster**. It ensures seamless updates to the live environment by leveraging **GitHub Actions**. Whenever code is pushed to the `main` branch, the pipeline builds Docker images for the backend and frontend, validates Kubernetes manifests, and deploys updated services to the k3s cluster. The pipeline also includes steps to roll back in case of errors during deployment.

---

##### CI/CD Flow

###### 1. **Trigger**

-   The pipeline is triggered by a push to the `main` branch of the GitHub repository.

###### 2. **Preparation**

-   Ensures that the job runs only for commits not made by the GitHub Actions bot.
-   Checks out the repository code with full commit history for accurate versioning.

###### 3. **Versioning**

-   Automatically increments the application version using the total number of commits in the repository.
-   Sets a unique Docker image tag based on the computed version (e.g., `v1.0.<commit_count>-prod`).

###### 4. **Docker Setup**

-   Configures **Docker Buildx** to build multi-platform Docker images (e.g., for ARM64).
-   Authenticates to Docker Hub using credentials stored as GitHub Secrets.

###### 5. **Build and Push Docker Images**

-   Builds and pushes the Docker image for the backend service from the `api` directory.
-   Builds and pushes the Docker image for the frontend service from the `eDB` directory.

###### 6. **Kubernetes Configuration**

-   Configures `kubectl` using the kubeconfig stored as a GitHub Secret to interact with the k3s cluster.
-   Validates access to the Kubernetes cluster by displaying cluster information.

###### 7. **Linting**

-   Lints the Kubernetes YAML manifests for both the backend and frontend services to ensure they are properly formatted.

###### 8. **Update Kubernetes Manifests**

-   Replaces placeholders in the Kubernetes deployment YAML files with the new Docker image tag to deploy the latest version of the services.

###### 9. **Validation**

-   Performs a dry-run validation of the updated YAML files to ensure they are correct and will apply successfully to the cluster.

###### 10. **Deployment**

-   Deploys the updated Kubernetes manifests to the k3s cluster using `kubectl apply`.
-   Monitors the rollout status of each deployment to ensure it succeeds.
-   Automatically rolls back the deployment if there are issues during the rollout.

###### 11. **Commit Updated Manifests**

-   Commits the updated Kubernetes manifests with the new image tags back to the GitHub repository for record-keeping.

###### 12. **Push Changes**

-   Pushes the committed changes to the `main` branch of the repository.

### Nx and Angular Architecture

![Frontend Setup Diagram](./diagrams/images/frontend-architecturev1.png)

### .NET architecture

![Backend Setup Diagram](./diagrams/images/backend-setupv1.png)

---

### K3s Handy Commands Cheat Sheet

#### General Commands

| Command                                                          | Description                                  |
| ---------------------------------------------------------------- | -------------------------------------------- |
| `kubectl get services`                                           | List all services in the cluster             |
| `kubectl get pods`                                               | List all running pods                        |
| `kubectl describe pod <pod-name>`                                | Get detailed information on a specific pod   |
| `kubectl logs <pod-name>`                                        | View logs for a specific pod                 |
| `kubectl port-forward svc/<service> <local-port>:<service-port>` | Forward a port for local access to a service |
| `kubectl delete pod <pod-name>`                                  | Delete a specific pod (it will be restarted) |
| `kubectl apply -f <filename>.yaml`                               | Apply a YAML configuration to the cluster    |
| `kubectl delete -f <filename>.yaml`                              | Delete resources defined in a YAML file      |
| `k3d cluster create <name>`                                      | Create a new K3s cluster                     |
| `k3d cluster delete <name>`                                      | Delete an existing K3s cluster               |
| `skaffold dev`                                                   | Start Skaffold in development mode           |
| `skaffold run`                                                   | Deploy the application to the cluster        |
| `skaffold delete`                                                | Remove all Skaffold-managed resources        |

#### Database Management Commands

| Command                                                 | Description                                                           |
| ------------------------------------------------------- | --------------------------------------------------------------------- |
| `kubectl port-forward svc/<postgres-service> 5432:5432` | Forward PostgreSQL service to localhost for local access              |
| `psql -h localhost -p 5432 -U <username> -d <database>` | Connect to PostgreSQL database locally                                |
| `CREATE DATABASE <database>;`                           | Create a new database inside PostgreSQL                               |
| `\l`                                                    | List all databases                                                    |
| `\c <database>`                                         | Switch to a specific database                                         |
| `\dt`                                                   | List all tables in the current database                               |
| `kubectl get pods -n <namespace>`                       | Check if the database pod is running                                  |
| `kubectl logs <pod-name> -n <namespace>`                | View logs for the database pod to troubleshoot issues                 |
| `dotnet ef migrations add <MigrationName>`              | Create a new migration to modify the database schema                  |
| `dotnet ef database update`                             | Apply migrations to update the database schema                        |
| `kubectl delete pod <postgres-pod-name> -n <namespace>` | Restart the PostgreSQL pod if it’s stuck or needs to be reinitialized |
| `SELECT pg_terminate_backend(pg_stat_activity.pid)`     | Terminate connections to a specific database (see below for full SQL) |

---
