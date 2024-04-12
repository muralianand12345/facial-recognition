import cv2
import os
import numpy as np

def return_128d_features(path_img, detector, predictor, face_reco_model):
    img_rd = cv2.imread(path_img)
    faces = detector(img_rd, 1)

    if len(faces) != 0:
        shape = predictor(img_rd, faces[0])
        face_descriptor = face_reco_model.compute_face_descriptor(img_rd, shape)
    else:
        face_descriptor = 0
    return face_descriptor

def return_features_mean_personX(path_face_personX, detector, predictor, face_reco_model):
    features_list_personX = []
    photos_list = os.listdir(path_face_personX)
    if photos_list:
        for i in range(len(photos_list)):
            features_128d = return_128d_features(path_face_personX + "/" + photos_list[i], detector, predictor, face_reco_model)
            if features_128d == 0:
                i += 1
            else:
                features_list_personX.append(features_128d)
    else:
        return 0
    
    if features_list_personX:
        features_mean_personX = np.array(features_list_personX, dtype=object).mean(axis=0)
    else:
        features_mean_personX = np.zeros(128, dtype=object, order='C')
    return features_mean_personX