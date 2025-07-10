import mediapipe as mp
import cv2
import math

mp_pose = mp.solutions.pose
pose = mp_pose.Pose(static_image_mode=True)


def get_angle(a, b, c):
    ba = [a[0] - b[0], a[1] - b[1]]
    bc = [c[0] - b[0], c[1] - b[1]]

    dot_product = ba[0] * bc[0] + ba[1] * bc[1]
    mag_ba = math.hypot(*ba)
    mag_bc = math.hypot(*bc)

    if mag_ba == 0 or mag_bc == 0:
        return 0

    cosine_angle = max(-1, min(1, dot_product / (mag_ba * mag_bc)))
    return math.degrees(math.acos(cosine_angle))

def analyze_frame(frame):
    results = pose.process(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))

   
    if not results.pose_landmarks:
        return {
            "error": "❌ No human posture detected. Please upload a gesture/posture video."
        }

    lm = results.pose_landmarks.landmark

    def get_coords(landmark):
        return [lm[landmark].x, lm[landmark].y]

   
    left_shoulder = get_coords(mp_pose.PoseLandmark.LEFT_SHOULDER)
    left_hip = get_coords(mp_pose.PoseLandmark.LEFT_HIP)
    left_knee = get_coords(mp_pose.PoseLandmark.LEFT_KNEE)
    left_ankle = get_coords(mp_pose.PoseLandmark.LEFT_ANKLE)
    left_ear = get_coords(mp_pose.PoseLandmark.LEFT_EAR)
    left_eye = get_coords(mp_pose.PoseLandmark.LEFT_EYE)

    
    back_angle = get_angle(left_shoulder, left_hip, left_knee)
    neck_angle = get_angle(left_eye, left_ear, left_shoulder)

   
    print("Back angle:", round(back_angle, 2))
    print("Neck angle:", round(neck_angle, 2))

    
    feedback = []

    if back_angle < 150:
        feedback.append("⚠️ Hunched back")

    if neck_angle > 45:
        feedback.append(f"⚠️ Neck bent too far ({round(neck_angle)}°)")

    if left_knee[0] > left_ankle[0]:
        feedback.append("⚠️ Knee over toe")

    return {
        "bad_posture": feedback,
        "debug": {
            "back_angle": round(back_angle, 2),
            "neck_angle": round(neck_angle, 2)
        }
    }
