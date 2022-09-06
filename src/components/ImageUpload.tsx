import React, { useState, useEffect } from "react";
import styles from "@styles/components/ImageUpload.module.css";

enum ImageUploadState {
  NoFile,
  Ready,
  Uploading,
  Done,
  Error,
}

export interface ImageUploadProp {
  file: File;
  result: File;
}

/**
 * File selector only for images.
 */
export function ImageUpload(prop: ImageUploadProp) {
  const [state, setState] = useState<ImageUploadState>(ImageUploadState.NoFile);

  useEffect(() => {
    if (
      prop.file instanceof File &&
      prop.result instanceof Blob &&
      prop.file.name == prop.result.name
    ) {
      setState(ImageUploadState.Ready);
    } else {
      setState(ImageUploadState.NoFile);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prop.file?.name, prop.file?.size, prop.result?.name, prop.result?.size]);

  /**
   * Handle files upload.
   */
  const handleUploadFiles = (e: React.FormEvent<EventTarget>) => {
    setState(ImageUploadState.Uploading);

    // Upload files as multipart/form-data
    const formData = new FormData();
    formData.append("file", prop.file);
    formData.append("result", prop.result);

    // TODO: move this work to a service. or not?
    fetch("/api/images/upload", {
      method: "POST",
      body: formData,
    })
      .then(async (resp) => {
        let data: {};
        let error: any;

        try {
          data = await resp.json();
          if (data["status"] != "success") {
            error = data;
          }
        } catch (err) {
          // Nextjs error handle return HTML
          error = resp;
        }

        if (!error) {
          setState(ImageUploadState.Done);
        } else {
          setState(ImageUploadState.Error);
          console.error("Upload error:", error);
        }
      })
      .catch((error) => {
        setState(ImageUploadState.Error);
        console.error("Upload error:", error);
      });
  };

  return (
    <>
      <div className={styles.box}>
        <div>
          {state == ImageUploadState.NoFile && <em>No processed image</em>}
          {state == ImageUploadState.Ready && (
            <button className={styles.upload} onClick={handleUploadFiles}>
              📤 Upload Images
            </button>
          )}
          {state == ImageUploadState.Uploading && <em>Uploading..</em>}
          {state == ImageUploadState.Done && <em>Images uploaded.</em>}
          {state == ImageUploadState.Error && (
            <span>
              <em>Upload failed</em> 😢
            </span>
          )}
        </div>
      </div>
    </>
  );
}
