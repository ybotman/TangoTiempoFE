import Link from 'next/link';
import styles from './page.module.css';

const AboutTural = () => {
  return (
    <div className={styles.container}>
      <Link href="/calendar" className={styles.backButton}>
        Back to Calendar
      </Link>
      <h1 className={styles.title}>About Tural</h1>
      <h3> CS student. Software Engineer </h3>
    </div>
  );
};

export default AboutTural;
