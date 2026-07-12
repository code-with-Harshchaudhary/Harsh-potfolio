import { useEffect, useRef } from 'react';
import { useSlotMachine } from '@/hooks/useSlotMachine';

interface Props {
  side: 'left' | 'right' | 'center';
  isHeroVisible: boolean;
}

export default function SlotMachineName({ side, isHeroVisible }: Props) {
  const { animateNameChange, initName } = useSlotMachine();
  const prevSideRef = useRef<string>('left');
  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      initName(side === 'left' ? 'Harsh' : 'Chaudhary');
      return;
    }

    if (!isHeroVisible) return;
    if (side !== prevSideRef.current && side !== 'center') {
      animateNameChange(side === 'left' ? 'Harsh' : 'Chaudhary');
      prevSideRef.current = side;
    }
  }, [side, isHeroVisible, animateNameChange, initName]);

  return (
    <div className="name-section" id="nameSection" aria-label="">
      <div className="name-display" id="nameDisplay" />
    </div>
  );
}