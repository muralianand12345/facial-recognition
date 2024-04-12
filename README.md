# Simple Facial Recognition

## Table of Contents
1. [Features](#features)
2. [System Requirements and Setup](#system-requirements-and-setup)
3. [Things to Note](#things-to-note)

## Features
- **Web:**
  - Identify faces
  - Capture faces
  - Guest option (not fully functional)
  - Admin panel for configuration

- **Python Backend API:**
  - API built using Flask
  - Fully custom and inspired by [coneypo's work](https://github.com/coneypo/Dlib_face_recognition_from_camera)
  - Local image storage
  - Utilizes ResNet 50 model

## System Requirements and Setup
- Download and install [CMake](https://cmake.org/download), and add CMake to your environment path.
- Download and Install [Visual Studio](https://visualstudio.microsoft.com/).
- Enable **Desktop development with C++** in Visual Studio.
- Navigate to your project directory and execute the following commands:

```bash
# Install required packages
python -m venv .venv
./.venv/Scripts/activate
pip install cmake
pip install -r requirements.txt

# Run your server
py app.py
or
python app.py
```

- To run your web application, follow these steps: (Ensure you have NodeJS installed)

```bash
#install packages
npm i -g typescript yarn ts-node
cd frontend
yarn
ts-node ./src/index.ts

#to build
npm build
npm start
```

### Thing to note:

- Some parts are incomplete (e.g., admin panel, notification).
- Future improvements include: adding an attendance register, viewing attendance in the admin panel, enhancing UI, and improving emotion detection.