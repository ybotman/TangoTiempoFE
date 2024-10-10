import styles from './page.module.css';

const AboutToby = () => {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>About Toby</h1>
      <p className={styles.paragraph}>
        Welcome to my corner of the tango tangled-web! I am a passionate IT
        leader based in Boston, GenAI, specializing in data-centric solutions
        and cloud architectures. And yes, I am a happy Milongero.
      </p>
      <h2 className={styles.subtitle}>Professional Background</h2>
      <p className={styles.paragraph}>
        With a wealth of experience in systems and application development, I
        have successfully aligned executive strategies with IT initiatives,
        particularly in the healthcare sector. My career journey has included
        significant roles such as Executive Director and Director of Enterprise
        Architecture. Recently, I was Gen AI Lead at Point32Health, where I led
        transformative AI and data platform projects.
      </p>
      <h2 className={styles.subtitle}>Argentine Tagno</h2>
      <p className={styles.paragraph}>
        Beyond EA and AI, GenAI, and a thousand other hobbies, I am particularly
        fond of Argentine tango. I am passionate about bringing the US tango
        community together through the TangoTiempo app. I While not a master, i
        study, read, listen, analize,and think about tango a lot. I do teach new
        and intermediates student on a regular basis. I am a student of the
        dance and the music. As well I am a student of the culture and the
        history of tango. I do teach a regular class in boston called TangoLab.
        We dance and study music and rhythms and work the study into the dance.
      </p>
      <h2 className={styles.subtitle}>Mission</h2>
      <p className={styles.paragraph}>
        I belive in the power of Thoughtful Thinking. You must know your power
        and privledge the art of overthinking, and honor the need and right to
        not. I love toleverage technology where it makes sense and burn it to
        the ground where it does not. Deliver innovative strategies to make a
        positive impact on the world.
      </p>
      <p className={`${styles.paragraph} ${styles.thinkBig}`}>
        Think Big, Deliver Small and Often.
      </p>
      <p className={`${styles.paragraph} ${styles.thinkBig}`}>
        Let in the moment, halfway down the stairs
      </p>
      <p className={`${styles.paragraph} ${styles.thinkBig}`}>
        If you are too busy to Travel, Play, and Dance, you are too busy
      </p>
    </div>
  );
};

export default AboutToby;
