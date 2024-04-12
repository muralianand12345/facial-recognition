import base64
import os
import cv2
import csv
import numpy as np
import dlib
import shutil
from flask import Flask, request, jsonify
from flask_cors import CORS

from functions.capture_img import pre_work_mkdir, create_face_folder, save_current_face
from functions.make_feature import return_features_mean_personX
from functions.live_video import load_face_database, process_frame

app = Flask(__name__)
CORS(app)

detector = dlib.get_frontal_face_detector()
predictor = dlib.shape_predictor("data/data_dlib/shape_predictor_68_face_landmarks.dat")
face_reco_model = dlib.face_recognition_model_v1(
    "data/data_dlib/dlib_face_recognition_resnet_model_v1.dat"
)

# Initialize variables
current_frame_faces_cnt = 0
current_face_dir = ""
path_photos_from_camera = "data/data_faces_from_camera/"
face_folder_created_flag = False
ss_cnt = 0
out_of_range_flag = False
path = "data/data_faces_from_camera/"


@app.route("/image", methods=["OPTIONS"])
def image_options():
    response = jsonify({"status": "success"})
    response.headers.add("Access-Control-Allow-Methods", "POST")
    response.headers.add("Access-Control-Allow-Headers", "Content-Type,Authorization")
    return response


@app.route("/admin/delete", methods=["OPTIONS"])
def delete_options():
    response = jsonify({"status": "success"})
    response.headers.add("Access-Control-Allow-Methods", "POST")
    response.headers.add("Access-Control-Allow-Headers", "Content-Type,Authorization")
    return response


@app.route("/admin/reload", methods=["OPTIONS"])
def reload_options():
    response = jsonify({"status": "success"})
    response.headers.add("Access-Control-Allow-Methods", "POST")
    response.headers.add("Access-Control-Allow-Headers", "Content-Type,Authorization")
    return response


@app.route("/video", methods=["OPTIONS"])
def video_options():
    response = jsonify({"status": "success"})
    response.headers.add("Access-Control-Allow-Methods", "POST")
    response.headers.add("Access-Control-Allow-Headers", "Content-Type,Authorization")
    return response


@app.route("/admin/delete", methods=["POST"])
def delete_db():

    empId = request.json.get("empId")

    folders_rd = os.listdir(path_photos_from_camera)
    for i in range(len(folders_rd)):

        person_name = folders_rd[i].split("_", 2)[-1]

        if empId == person_name:
            shutil.rmtree(path_photos_from_camera + folders_rd[i])
            return jsonify({"status": "success", "message": "Database cleared"}, 200)

    return jsonify({"status": "success", "message": "ID doesn't exist!"}, 200)


# http://localhost:5000/admin/reload
@app.route("/admin/reload", methods=["POST"])
def reload():

    global path_photos_from_camera

    try:

        person_list = os.listdir(path)
        person_list.sort()

        with open("data/features_all.csv", "w", newline="") as csvfile:
            writer = csv.writer(csvfile)
            for person in person_list:
                features_mean_personX = return_features_mean_personX(
                    path_photos_from_camera + person,
                    detector,
                    predictor,
                    face_reco_model,
                )
                if len(person.split("_", 2)) == 2:
                    person_name = person
                else:
                    person_name = person.split("_", 2)[-1]

                features_mean_personX = np.insert(
                    features_mean_personX, 0, person_name, axis=0
                )
                writer.writerow(features_mean_personX)
            return jsonify({"status": "success", "message": "Database reloaded"}, 200)

    except Exception as e:
        print(e)
        return (
            jsonify({"status": "failed", "message": "Something went wrong try again"}),
            400,
        )


@app.route("/image", methods=["POST"])
def image():
    global current_frame_faces_cnt
    global face_folder_created_flag
    global ss_cnt
    global out_of_range_flag
    global current_face_dir

    try:
        data = request.json.get("image")
        name = request.json.get("name")

        if not data or not name:
            return (
                jsonify({"status": "failed", "message": "No image data or name"}),
                400,
            )

        image = base64.b64decode(data.split(",")[1])
        nparr = np.frombuffer(image, np.uint8)
        frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        current_face_dir, face_folder_created_flag = create_face_folder(
            name, path_photos_from_camera, path
        )

        if not face_folder_created_flag:
            return (
                jsonify({"status": "failed", "message": "Folder creation failed"}),
                400,
            )

        faces = detector(frame, 0)
        current_frame_faces_cnt = len(faces)

        save_result = {"status": "success", "message": ""}

        # cv2.imwrite('face.jpg', frame)

        if len(faces) == 0:
            return jsonify({"status": "failed", "message": "No face detected"}), 400

        for k, d in enumerate(faces):

            expansion_factor = 0.5
            top = int(max(0, d.top() - expansion_factor * (d.bottom() - d.top())))
            bottom = int(
                min(
                    frame.shape[0],
                    d.bottom() + expansion_factor * (d.bottom() - d.top()),
                )
            )
            left = int(max(0, d.left() - expansion_factor * (d.right() - d.left())))
            right = int(
                min(
                    frame.shape[1],
                    d.right() + expansion_factor * (d.right() - d.left()),
                )
            )

            # cv2.imwrite('face.jpg', frame)

            face_ROI_image = frame[top:bottom, left:right]
            # face_ROI_image = cv2.cvtColor(face_ROI_image, cv2.COLOR_BGR2RGB)

            save_result = save_current_face(
                face_ROI_image,
                current_face_dir,
                current_frame_faces_cnt,
                out_of_range_flag,
            )

            frame = cv2.rectangle(
                frame, (d.left(), d.top()), (d.right(), d.bottom()), (255, 255, 255), 2
            )

        if save_result.get("status") == "failed":
            return (
                jsonify({"status": "failed", "message": save_result.get("message")}),
                400,
            )
        else:
            return (
                jsonify({"status": "success", "message": save_result.get("message")}),
                200,
            )

    except Exception as e:
        print(e)
        return (
            jsonify({"status": "failed", "message": "Something went wrong try again"}),
            400,
        )


@app.route("/video", methods=["POST"])
def video():
    global current_frame_faces_cnt, face_folder_created_flag, ss_cnt, out_of_range_flag, current_face_dir

    try:
        data = request.json.get("image")

        if not data:
            return (
                jsonify({"status": "failed", "message": "No image data or name"}),
                400,
            )

        image_chunk = base64.b64decode(data.split(",")[1])
        face_name_known_list, face_feature_known_list = load_face_database("data/")

        if face_feature_known_list is None or face_name_known_list is None:
            return (
                jsonify({"status": "failed", "message": "Database not found"}),
                400,
            )

        result = process_frame(
            image_chunk,
            face_feature_known_list,
            face_name_known_list,
            detector,
            face_reco_model,
            predictor,
        )

        if result.get("status") == "failed":
            return jsonify({"status": "failed", "message": result.get("message")}), 400

        return jsonify(result), 200

    except Exception as e:
        print(e)
        return (
            jsonify({"status": "failed", "message": "Something went wrong try again"}),
            400,
        )


if __name__ == "__main__":
    pre_work_mkdir(path)
    app.run(port=5000)
