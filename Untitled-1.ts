<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Smart Attendance System with Face Recognition</title>
    <script defer src="https://cdn.jsdelivr.net/npm/@tensorflow/tfjs"></script>
    <script defer src="https://cdn.jsdelivr.net/npm/@vladmandic/face-api"></script>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 20px;
        }
        .container {
            max-width: 600px;
            margin: auto;
            background: white;
            padding: 20px;
            border-radius: 5px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
        video {
            width: 100%;
            border: 1px solid #ddd;
        }
        .student-list {
            margin: 20px 0;
        }
        .student {
            display: flex;
            justify-content: space-between;
            padding: 10px;
            border-bottom: 1px solid #ddd;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Smart Attendance System</h1>
        <video id="video" autoplay muted></video>
        <div id="studentList" class="student-list"></div>
        <button id="submitAttendance">Submit Attendance</button>
        <div id="attendanceResult"></div>
    </div>

    <script>
        const video = document.getElementById('video');
        const studentList = document.getElementById('studentList');
        const attendanceResult = document.getElementById('attendanceResult');

        const students = [
            { id: 1, name: 'John Doe', image: 'path/to/john.jpg' },
            { id: 2, name: 'Jane Smith', image: 'path/to/jane.jpg' },
            { id: 3, name: 'Alice Johnson', image: 'path/to/alice.jpg' },
            { id: 4, name: 'Bob Brown', image: 'path/to/bob.jpg' }
        ];

        let labeledFaceDescriptors = [];
        let recognizedNames = [];

        async function loadModels() {
            await faceapi.nets.ssdMobilenetv1.loadFromUri('/models');
            await faceapi.nets.faceLandmark68TinyNet.loadFromUri('/models');
            await faceapi.nets.faceRecognitionNet.loadFromUri('/models');
        }

        async function createLabeledFaceDescriptors() {
            for (const student of students) {
                const img = await faceapi.fetchImage(student.image);
                const detections = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor();
                if (detections) {
                    labeledFaceDescriptors.push(new faceapi.LabeledFaceDescriptors(student.name, [detections.descriptor]));
                }
            }
        }

        async function startVideo() {
            const stream = await navigator.mediaDevices.getUser Media({ video: {} });
            video.srcObject = stream;
            video.srcObject = stream;
        }

        async function recognizeFaces() {
            const detections = await faceapi.detectAllFaces(video).withFaceLandmarks().withFaceDescriptors();
            const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors, 0.6);
            const results = detections.map(d => faceMatcher.findBestMatch(d.descriptor));
            recognizedNames = results.map(result => result.toString().split(' ')[0]);
            updateAttendance();
        }

        function updateAttendance() {
            const uniqueNames = [...new Set(recognizedNames)];
            studentList.innerHTML = ''; // Clear previous entries
            uniqueNames.forEach(name => {
                const studentDiv = document.createElement('div');
                studentDiv.className = 'student';
                studentDiv.innerHTML = `<span>${name}</span>`;
                studentList.appendChild(studentDiv);
            });
        }

        document.getElementById('submitAttendance').addEventListener('click', () => {
            const attendance = [...new Set(recognizedNames)];
            attendanceResult.innerHTML = `<h3>Attendance Submitted:</h3><p>${attendance.join(', ')}</p>`;
        });

        async function init() {
            await loadModels();
            await createLabeledFaceDescriptors();
            await startVideo();
            setInterval(recognizeFaces, 1000); // Recognize faces every second
       
