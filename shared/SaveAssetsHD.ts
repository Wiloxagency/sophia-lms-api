import axios from "axios";
import path from "path";
import FormData from "form-data";
import mime from "mime-types";

export async function saveFile(courseCode: string, fileName: string, file: Buffer, nameType: string = null) {
    if (!courseCode || !fileName || !file) {
        return "Missing required parameters";
    }

    const directories: { [key: string]: string } = {
        mp3: "Audios",
        jpg: "Images",
        jpeg: "Images",
        png: "Images",
        gif: "Images",
        webp:"Images",
        mp4: "Videos",
        mkv: "Videos",
        pdf: "Documents",
        doc: "Quizzes",
        docx: "Quizzes",
        zip: "Compressed",
        rar: "Compressed",
        '7z': "Compressed",
        csv: "Data",
        json: "Presentations"
    };

    const fileExtension = path.extname(fileName).substring(1).toLowerCase();
    const directory = nameType !== null ? nameType : (directories[fileExtension] || "Others");

    const mimeType = mime.lookup(fileExtension);
    
    const formData = new FormData();
    formData.append("courseId", courseCode);
    formData.append("fileType", directory);
    formData.append("fileName", fileName);
    formData.append("file", file, {
        filename: fileName,
        contentType: mimeType,
    });

    console.log("*-* formData ",formData)

    try {
        const response = await axios.post("https://sophia-assets-api.wiloxagency.com/api/files/upload", formData, {
        //const response = await axios.post("http://localhost:3000/api/files/upload", formData, {
            headers: {
                ...formData.getHeaders(),
                "Content-Length": formData.getLengthSync(),
            },
            maxBodyLength: Infinity,
        });

        console.log("Response:", response.data);
        return response.data;
    } catch (error) {
        console.error("Error uploading file:", error.message);
        throw error;
    }
}


