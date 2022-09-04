import Head from "next/head";
import React from "react";
import { ImageFileInput } from "@components/ImageFileInput";
import styles from "@styles/pages/Home.module.css";

export default function Home() {
  const handleImageChange = (file: File) => {
    console.log(file);
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

        <div className={styles.fileInput}>
          <ImageFileInput onFileChange={handleImageChange} />
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
