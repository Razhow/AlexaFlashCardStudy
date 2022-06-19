import cv2
from cv2 import kmeans
import numpy as np
from sklearn import cluster
from GoogleApi import sendData

blobParameters = cv2.SimpleBlobDetector_Params() 

#Simpleblobdetector filtered to detect inertia
blobParameters.filterByInertia
blobParameters.minInertiaRatio = 0.8
diceResult = 25
detector = cv2.SimpleBlobDetector_create(blobParameters)
# Select webcam
cap = cv2.VideoCapture(0)
diceEyes = []

#Function to detect the blob, by image filters.
def get_inertia_blobs(image):
    image_blur = cv2.medianBlur(image, 7)
    image_gray = cv2.cvtColor(image_blur, cv2.COLOR_BGR2GRAY)
    blobs = detector.detect(image_gray)

    return blobs


def Cluster_blobs(blobs):
    
    dice_position = [] 
    for b in blobs:
        position = b.pt

        if position != None: #if blobs coordinates detected
            dice_position.append(position)


    if len(dice_position) > 0:
        dice_position = np.asarray(dice_position)# convert the list to an array
        #clustering scan with the parameters of distance between blobs and the number of points to create core point.
        DBSCAN_Cluster = cluster.DBSCAN(eps=30, min_samples=0)
        DBSCAN_Cluster.fit(dice_position) 

        kmeans_Cluster = cluster.KMeans(n_clusters = len(dice_position), random_state=0)
        #kmeans_Cluster.fit(dice_position)
        

        #labels starts from zero 
        diceAmount = max(DBSCAN_Cluster.labels_) + 1

        dice = []
        # Calculate centroid of each dice, the average between all a dice's dots

        for i in range(diceAmount):

            diceCoords = dice_position[DBSCAN_Cluster.labels_ == i] #Coordinates
            diceEyes.append(len(diceCoords))   
        return 

    else:
        return []


while(True):
        ret,video = cap.read() 
        blobs = get_inertia_blobs(video)
        Cluster_blobs(blobs)

        #this line Displays the feed
        #cv2.imshow("video", video)
        if not ret:
            print("no video footage received. Application shutting down...")
            break
        if(len(diceEyes) >=2):
            if(diceResult != (diceEyes[len(diceEyes) - 2] + diceEyes[len(diceEyes) - 1] )):
                diceResult = diceEyes[len(diceEyes) - 2] + diceEyes[len(diceEyes) - 1]
                sendData(diceResult)
                print(diceResult)
        
        stop = cv2.waitKey(1)
        #stop if press escape
        if stop & 0xFF == 27: 
            cv2.destroyAllWindows()
            cap.release()
        