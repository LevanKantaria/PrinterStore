import React, { useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import classes from "./DragAndDrop.module.css";

// Maximum file size: 5MB per image
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes

function DragAndDrop(props) {
  const [dragIsValid, setDragIsValid] = useState(false);
  const [error, setError] = useState("");
  const [imageNames, setImageNames] = useState([]);
  
  const onDrop = (acceptedFiles, rejectedFiles) => {
    // Clear previous errors
    setError("");
    
    // Check for rejected files (too large, wrong type, etc.)
    if (rejectedFiles && rejectedFiles.length > 0) {
      const rejection = rejectedFiles[0];
      if (rejection.errors) {
        const error = rejection.errors[0];
        if (error.code === 'file-too-large') {
          const fileSizeMB = (rejection.file.size / (1024 * 1024)).toFixed(2);
          setError(`File "${rejection.file.name}" is too large (${fileSizeMB}MB). Maximum size is 5MB per image.`);
        } else if (error.code === 'file-invalid-type') {
          setError(`File "${rejection.file.name}" is not a valid image type. Please use JPG, PNG, or WebP.`);
        } else {
          setError(`Error with file "${rejection.file.name}": ${error.message}`);
        }
        setDragIsValid(false);
        return;
      }
    }
    
    // Validate all accepted files
    const oversizedFiles = acceptedFiles.filter(file => file.size > MAX_FILE_SIZE);
    if (oversizedFiles.length > 0) {
      const fileNames = oversizedFiles.map(f => f.name).join(", ");
      setError(`The following files exceed 5MB limit: ${fileNames}`);
      setDragIsValid(false);
      return;
    }
    
    // All files are valid
    setError("");
    setDragIsValid(true);
  };

  const { acceptedFiles, getRootProps, getInputProps, fileRejections } = useDropzone({ 
    multiple: true,
    accept: {
      'image/*': ['.jpg', '.jpeg', '.png', '.webp']
    },
    maxSize: MAX_FILE_SIZE,
    onDrop,
  });

  const uploadHandler = (event) => {
    event.preventDefault();
  };

  let files = acceptedFiles.map((file) => (
    <li key={file.path}>
      {file.path} - {file.size} bytes
    </li>
  ));

  useEffect(() => {
    const storedImageNames = localStorage.getItem("image-names");
    if (storedImageNames) {
      setImageNames(JSON.parse(storedImageNames));
    }
  }, []);

  useEffect(() => {
    if (acceptedFiles.length > 0 && !error) {
      const newImageNames = acceptedFiles.map(file => file.name);
      setImageNames(newImageNames);
      setDragIsValid(true);

      const readFiles = acceptedFiles.map((file) => {
        return new Promise((resolve, reject) => {
          // Double-check file size before reading
          if (file.size > MAX_FILE_SIZE) {
            reject(new Error(`File ${file.name} exceeds size limit`));
            return;
          }
          
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = () => {
            resolve(reader.result);
          };
          reader.onerror = (error) => {
            reject(error);
          };
        });
      });

      Promise.all(readFiles)
        .then(images => {
          console.log("Read images:", images); // Debugging: Log the read images
          props.onChange(images, acceptedFiles.length > 0);
        })
        .catch(error => {
          console.log("Error reading files: ", error);
          setError(`Error reading files: ${error.message}`);
          setDragIsValid(false);
        });
    } else if (acceptedFiles.length === 0) {
      setDragIsValid(false);
    }
  }, [acceptedFiles, error]);

  useEffect(() => {
    localStorage.setItem("image-names", JSON.stringify(imageNames));
  }, [imageNames]);

  let dragAndDropClass = classes.dragDrop;
  // if (dragIsValid && dragIsTouched) {
  //   dragAndDropClass = classes.dragDrop;
  // } else if(!dragIsValid && dragIsTouched) {
  //   dragAndDropClass = classes.dragDropInvalid;
  // }

  return (
    <section>
      <div
        {...getRootProps({ className: "dropzone" })}
        className={dragAndDropClass}
      >
        <input {...getInputProps()} />
        <div className={classes.dragText}>
          {props.text}
        </div>
        <div className={classes.buttonAndText}>
          <button className={classes.dragButton} onClick={uploadHandler}>
            Select
          </button>
          {imageNames.join(", ")}
        </div>
      </div>
      {error && (
        <div className={classes.errorMessage}>
          {error}
        </div>
      )}
      {acceptedFiles.length > 0 && !error && (
        <div className={classes.fileInfo}>
          {acceptedFiles.length} file(s) selected (max 5MB each)
        </div>
      )}
      <ul>{files}</ul>
    </section>
  );
}

export default DragAndDrop;
