import Link from 'next/link';
import styles from './page.module.css';

const AboutWailing = () => {
  return (
    <div className={styles.container}>
      <Link href="/calendar" className={styles.backButton}>
        Back to Calendar
      </Link>
    </div>
  );
};

export default AboutWailing;
