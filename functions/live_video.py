import cv2
import numpy as np
import pandas as pd
import os
import base64
from PIL import Image, ImageDraw, ImageFont

face_name_known_list = []
face_feature_known_list = []


@staticmethod
def return_euclidean_distance(feature_1, feature_2):
    feature_1 = np.array(feature_1)
    feature_2 = np.array(feature_2)
    dist = np.sqrt(np.sum(np.square(feature_1 - feature_2)))
    return dist


def load_face_database(path):
    face_feature_known_list = []
    face_name_known_list = []

    if os.path.exists(path):

        feature_path = path + "features_all.csv"

        csv_rd = pd.read_csv(feature_path, header=None)

        for i in range(csv_rd.shape[0]):
            features_someone_arr = []
            face_name_known_list.append(csv_rd.iloc[i][0])
            for j in range(1, 129):
                if csv_rd.iloc[i][j] == "":
                    features_someone_arr.append("0")
                else:
                    features_someone_arr.append(csv_rd.iloc[i][j])
            face_feature_known_list.append(features_someone_arr)
        return face_name_known_list, face_feature_known_list
    else:
        return None, None


def draw_names(
    img_rd, current_frame_face_name_list, current_frame_face_name_position_list
):
    img = Image.fromarray(cv2.cvtColor(img_rd, cv2.COLOR_BGR2RGB))
    draw = ImageDraw.Draw(img)
    font_chinese = ImageFont.truetype("simsun.ttc", 30)
    for i in range(len(current_frame_face_name_list)):
        draw.text(
            xy=current_frame_face_name_position_list[i],
            text=current_frame_face_name_list[i],
            font=font_chinese,
            fill=(255, 255, 0),
        )
    img_rd = cv2.cvtColor(np.array(img), cv2.COLOR_RGB2BGR)
    return img_rd


def process_frame(
    image_chunk,
    face_feature_known_list,
    face_name_known_list,
    detector,
    face_reco_model,
    predictor,
):
    try:
        img_rd = cv2.imdecode(np.frombuffer(image_chunk, np.uint8), cv2.IMREAD_COLOR)
        faces = detector(img_rd, 0)

        if len(faces) == 0:
            return {"status": "failed", "message": "No face detected"}

        current_frame_face_feature_list = []
        current_frame_face_name_list = []
        current_frame_face_name_position_list = []

        for i, d in enumerate(faces):
            shape = predictor(img_rd, d)
            current_frame_face_feature_list.append(
                face_reco_model.compute_face_descriptor(img_rd, shape)
            )
            current_frame_face_name_list.append("unknown")
            current_frame_face_name_position_list.append(
                (d.left(), int(d.bottom() + (d.bottom() - d.top()) / 4))
            )

        for k in range(len(faces)):
            current_frame_e_distance_list = []
            for i in range(len(face_feature_known_list)):
                if str(face_feature_known_list[i][0]) != "0.0":
                    e_distance_tmp = return_euclidean_distance(
                        current_frame_face_feature_list[k], face_feature_known_list[i]
                    )
                    current_frame_e_distance_list.append(e_distance_tmp)
                else:
                    current_frame_e_distance_list.append(999999999)

            similar_person_num = current_frame_e_distance_list.index(
                min(current_frame_e_distance_list)
            )

            if min(current_frame_e_distance_list) < 0.4:
                current_frame_face_name_list[k] = face_name_known_list[
                    similar_person_num
                ]

        img_with_names = draw_names(
            img_rd, current_frame_face_name_list, current_frame_face_name_position_list
        )

        # save image in local
        cv2.imwrite("image.jpg", img_with_names)

        username_string = ""
        for username in current_frame_face_name_list:
            username_string += username + ", "

        return {
            "status": "success",
            "image": base64.b64encode(cv2.imencode(".jpg", img_with_names)[1]).decode(),
            "message": f"Welcome {username_string[:-2]}",
        }

    except Exception as e:
        return {"status": "failed", "message": str(e)}
