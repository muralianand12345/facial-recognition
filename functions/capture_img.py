import os
import cv2

def pre_work_mkdir(path_photos_from_camera):
    if not os.path.isdir(path_photos_from_camera):
        os.makedirs(path_photos_from_camera)

def check_existing_faces_cnt(path):
    if os.listdir(path):
        person_list = os.listdir(path)
        person_num_list = []
        for person in person_list:
            person_order = person.split("_")[1].split("_")[0]
            person_num_list.append(int(person_order))
        return max(person_num_list)
    else:
        return 0
    
def create_face_folder(input_name_char, path_photos_from_camera, path):
    global current_face_dir
    global face_folder_created_flag
    global ss_cnt
    global existing_faces_cnt

    already_exist_flag = False
    already_exist_folder_name = ""

    person_list = os.listdir(path)
    for person in person_list:
        if input_name_char in person:
            already_exist_flag = True
            already_exist_folder_name = person
            break

    if already_exist_flag == False:
        existing_faces_cnt = check_existing_faces_cnt(path)
        existing_faces_cnt += 1

        person_face_folder = (
            path_photos_from_camera
            + "person_"
            + str(existing_faces_cnt)
            + "_"
            + input_name_char
        )

        if not os.path.exists(person_face_folder):
            os.makedirs(person_face_folder)
            current_face_dir = person_face_folder
            face_folder_created_flag = True
            ss_cnt = 0
        else:
            face_folder_created_flag = False

    else:
        current_face_dir = path_photos_from_camera + already_exist_folder_name
        face_folder_created_flag = True
        existing_img_cnt = len(os.listdir(current_face_dir))
        ss_cnt = existing_img_cnt

    return current_face_dir, face_folder_created_flag

def save_current_face(face_ROI_image, current_face_dir, current_frame_faces_cnt, out_of_range_flag):
    global ss_cnt
    global face_folder_created_flag
    
    #cv2.imwrite('face.jpg', face_ROI_image)

    if face_folder_created_flag:
        if current_frame_faces_cnt == 1:
            if not out_of_range_flag:
                ss_cnt += 1
                cv2.imwrite(
                    current_face_dir +
                    f"/img_face_{ss_cnt}.jpg", face_ROI_image
                )
                return {"status": "success", "message": "Face saved successfully"}
            else:
                return {"status": "failed", "message": "Out of range"}
        else:
            return {"status": "failed", "message": "No face detected or multiple faces detected"}
    else:
        return {"status": "failed", "message": "Folder creation failed"}

#export