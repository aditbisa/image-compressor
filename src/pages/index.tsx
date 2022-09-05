import Head from "next/head";
import React, { useState } from "react";
import { ImageFileInput } from "@components/ImageFileInput";
import { ImageCompress } from "@components/ImageCompress";
import styles from "@styles/pages/Home.module.css";

export default function Home() {
  const [file, setFile] = useState<File>();
  const [result, setResult] = useState<File>();

  const options = {
    maxSizeMB: 1,
    maxWidthOrHeight: 1024,
  };

  const handleImageChange = (file: File) => {
    console.log(file);
    setFile(file);
  };

  const handleCompressionResult = (file: File) => {
    console.log(file);
    setResult(file);
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>Image Compressor</title>
        <meta
          name="description"
          content="Compress image in browser and compare."
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>Image Compressor</h1>

        <div className={styles.fileBox}>
          <ImageFileInput onFileChange={handleImageChange} />

          <ImageCompress
            file={file}
            options={options}
            onCompressionResult={handleCompressionResult}
          />
        </div>
      </main>

      <footer className={styles.footer}>
        <a
          href="https://github.com/aditbisa/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Powered by ☕
        </a>
      </footer>
    </div>
  );
}
