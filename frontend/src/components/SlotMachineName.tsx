import { useEffect, useRef } from 'react';
import { useSlotMachine } from '@/hooks/useSlotMachine';

interface Props {
  side: 'left' | 'right' | 'center';
  isHeroVisible: boolean;
}

export default function SlotMachineName({ side, isHeroVisible }: Props) {
  const { currentName, animateNameChange } = useSlotMachine();
  const prevSideRef = useRef<string>('left');

  useEffect(() => {
    if (!isHeroVisible) return;
    if (side !== prevSideRef.current && side !== 'center') {
      animateNameChange(side === 'left' ? 'YOUR' : 'NAME');
      prevSideRef.current = side;
    }
  }, [side, isHeroVisible, animateNameChange]);

  return (
    <div className="name-section" id="nameSection" aria-label="Your Name">
      <div className="name-display" id="nameDisplay">
        {currentName.split('').map((ch, i) => (
          <div key={`${currentName}-${i}`} className="name-slot" style={{ width: 'auto' }}>
            <div className="name-reel">
              <span className="name-char">{ch}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
