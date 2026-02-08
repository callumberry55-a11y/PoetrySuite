import { FC, useEffect, useState } from 'react';
import styles from './PoemOfTheDay.module.css';

interface Poem {
  title: string;
  author: string;
  lines: string[];
}

const PoemOfTheDay: FC = () => {
  const [poem, setPoem] = useState<Poem | null>(null);

  useEffect(() => {
    // In a real implementation, this would fetch from an API.
    setPoem({
      title: 'The Road Not Taken',
      author: 'Robert Frost',
      lines: [
        'Two roads diverged in a yellow wood,',
        'And sorry I could not travel both',
        'And be one traveler, long I stood',
        'And looked down one as far as I could',
        'To where it bent in the undergrowth;',
      ],
    });
  }, []);

  if (!poem) {
    return <div>Loading...</div>;
  }

  return (
    <div className={styles.widget}>
      <h3>{poem.title}</h3>
      <p>by {poem.author}</p>
      <div className={styles.poemLines}>
        {poem.lines.map((line, index) => (
          <p key={index}>{line}</p>
        ))}
      </div>
    </div>
  );
};

export default PoemOfTheDay;
