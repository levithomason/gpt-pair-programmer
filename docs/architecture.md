# System Architecture

## Introduction

This document provides a comprehensive overview of the architecture of the system project. It aims to give readers a clear understanding of the project structure, design, and functionalities.

## Overview

The system is designed as a REST server that offers a suite of tools for creating, managing, and working on projects. It is built using Node.js and Express and follows a modular architecture, allowing for easy extensibility with additional tools and plugins.

## Directory Structure

The project is organized into several key directories and files:

- **.archived/**: Contains archived files or older versions of the project.
- **.well-known/**: Used for web server authentication or other web-related configurations.
- **gpt-home/**: A workspace or home for the GPT project.
- **src/**: The source code directory, housing the main server logic, tools, configurations, types, and utilities.

Each directory and file plays a specific role in the system, ensuring modularity and organization.

## Server Architecture

The main server logic is housed in the `server.ts` file within the `src` directory. Here is a breakdown of its architecture:

- **Imports and Initial Setup**: The server imports necessary modules and initializes configurations and a logger.
- **Middleware Configuration**: The server sets up middleware for logging HTTP requests, handling CORS, and parsing request bodies.
- **Tool Routes Configuration**: The server dynamically loads tool routes from the `tools` directory. Each tool is expected to have its own routes and OpenAPI spec.
- **OpenAI Plugin Routes**: The server provides specific routes for OpenAI plugins, such as serving the logo and the AI plugin JSON.
- **Server Initialization**: The server starts and listens on a specific port, ready to handle incoming requests.

## Tools Architecture

The `tools` directory is a central part of the system, housing individual tools that provide specific functionalities. Each tool follows a consistent structure with its own routes and OpenAPI specification.

### Projects Tool

As an example, the `projects` tool offers functionalities related to project management. Here is a breakdown of its key features:

- **State Management**: The tool maintains a state to track the active project, persisted in a `state.json` file.
- **Utility Functions**: Functions to ensure project directories exist, list projects, create or delete projects, and set an active project.
- **Routes**: Provides routes to list, create, delete, and set active projects, execute commands within projects, and retrieve their file tree structure.
- **Git Integration**: The tool integrates with Git to initialize new projects and commit changes when necessary.

### System Tool

The `system` tool offers functionalities related to system operations and is housed within the `tools` directory.

#### Key Features:

1. **Retrieve System Info**: The tool provides an endpoint (`GET /system/info`) to fetch various system details, including the current working directory, system architecture, platform, and versions of tools like Git, Node.js, and Yarn.

2. **Execute System Commands**: The tool allows for the execution of system commands via the `POST /system/exec` endpoint. Users can specify the command to be executed and an optional current working directory.

3. **Generate Directory Tree**: The tool can generate a tree structure of the file system using the `GET /system/tree` endpoint. This provides a visual representation of the directory structure up to a specified depth.

The tool leverages utility functions to perform its core operations, ensuring modularity and reusability of code.

## Configuration

The `config.ts` file provides global configurations used throughout the project. It defines constants related to token limits, project directories, and workspace paths.

## Utility Functions

The `utils.ts` file offers utility functions essential for various operations, including string manipulation, shell output cleaning, and directory tree generation.

## Data Structures and Types

The `types.ts` file defines the data structure for an OpenAPI specification. This type ensures consistent structure for OpenAPI specifications used in the project, aiding in their generation, validation, and merging.

## Appendices

- **OpenAPI Specification**: The project uses OpenAPI specifications to define the structure and endpoints of the API. This ensures clear documentation and understanding of the API for consumers.
