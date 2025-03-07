import axios from "axios";
import path from "path";

export async function saveFile(courseCode: string, fileName: string, file: Buffer) {

    if (!courseCode || !fileName || !file) {
        return "Missing required parameters";
    }

    const directories: { [key: string]: string } = {
        "mp3": "Audios",
        "jpg": "Images",
        "jpeg": "Images",
        "png": "Images",
        "gif": "Images",
        "mp4": "Videos",
        "mkv": "Videos",
        "pdf": "Documents",
        "doc": "Documents",
        "docx": "Documents",
        "zip": "Compressed",
        "rar": "Compressed",
        "7z": "Compressed",
        "csv": "Data"
    };

    const fileExtension = path.extname(fileName).substring(1).toLowerCase();
    const directory = directories[fileExtension] || "Others";

    const requestData = {
        courseId: courseCode,
        fileType: directory,
        fileName: fileName,
        file: file,
    };

    try {
        const response = await axios.post(
            "https://sophia-assets-api.wiloxagency.com/api/files/upload",
            requestData,
            {
                headers: { "Content-Type": "application/json" },
                maxBodyLength: Infinity,
            }
        );
        console.log("Response:", response.data);
        return response.data;
    } catch (error) {
        console.error("Error uploading file:", error.message);
        throw error;
    }
}
