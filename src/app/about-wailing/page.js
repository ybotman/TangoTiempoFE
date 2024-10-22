import Link from 'next/link';
import styles from './page.module.css';

const AboutWailing = () => {
  return (
    <div className={styles.container}>
      <Link href="/calendar" className={styles.backButton}>
        Back to Calendar
      </Link>
         <p className={styles.paragraph}>
        <h4>Its One Beauiful Dance.  I study from Juana Sepulvea . . .</h4>
      </p>
    </div>
  );
};

export default AboutWailing;
