import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ClosedInvitation } from './ClosedInvitation';
import { NameEntryModal } from './NameEntryModal';
import { OpenedInvitation } from './OpenedInvitation';

export function TrifoldInvitation() {
  const [state, setState] = useState('closed'); // 'closed' | 'entering-name' | 'opened'
  const [guestName, setGuestName] = useState('');

  const handleOpenClick = () => {
    setState('entering-name');
  };

  const handleValidName = (name) => {
    setGuestName(name);
    setState('opened');
  };

  return (
    <AnimatePresence mode="wait">
      {/* Closed Invitation */}
      {state === 'closed' && (
        <motion.div
          key="closed"
          exit={{ opacity: 0, transition: { duration: 0.4 } }}
        >
          <ClosedInvitation onOpen={handleOpenClick} />
        </motion.div>
      )}

      {/* Name Entry Modal over closed invitation */}
      {state === 'entering-name' && (
        <motion.div
          key="entering"
          exit={{ opacity: 0, transition: { duration: 0.3 } }}
        >
          <ClosedInvitation onOpen={() => {}} />
          <NameEntryModal isOpen={true} onValidName={handleValidName} />
        </motion.div>
      )}

      {/* Opened Trifold */}
      {state === 'opened' && (
        <motion.div
          key="opened"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <OpenedInvitation guestName={guestName} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
