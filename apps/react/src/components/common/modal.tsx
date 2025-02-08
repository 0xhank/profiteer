import React, { ReactNode, createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";

interface ModalContextType {
  isOpen: boolean;
  title?: string;
  handleClose: () => void;
  blockClose: boolean;
  handleOpen: () => void;
}

const ModalContext = createContext<ModalContextType>({
  isOpen: false,
  title: undefined,
  handleClose: () => null,
  handleOpen: () => null,
  blockClose: false,
});

interface ModalProps {
  children: ReactNode;
  title?: string;
  startOpen?: boolean;
  onClose?: () => void;
  blockClose?: boolean;
}

export const Modal: React.FC<ModalProps> & {
  Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>>;
  CloseButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>>;
  Content: React.FC<{ children: ReactNode; className?: string }>;
} = ({ children, title, startOpen = false, onClose, blockClose = false }) => {
  const [isOpen, setIsOpen] = useState(startOpen);

  const handleClose = useCallback(() => {
    if (blockClose || !isOpen) return;
    onClose?.();
    setIsOpen(false);
  }, [blockClose, isOpen, onClose]);

  useEffect(() => {

    // use a dom listener to keep esc in any case
    const closeOnEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        handleClose();
      }
    };
    addEventListener("keydown", closeOnEsc);

    return () => {
      removeEventListener("keydown", closeOnEsc);

    };
  }, [isOpen, handleClose]);

  return (
    <ModalContext.Provider
      value={{
        isOpen,
        handleClose,
        title,
        handleOpen: () => setIsOpen(true),
        blockClose,
      }}
    >
      {children}
    </ModalContext.Provider>
  );
};

Modal.Button = function ModalButton(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { handleOpen } = useContext(ModalContext);

  return (
    <button
      {...props}
      onClick={(e) => {
        handleOpen();
        props.onClick?.(e);
      }}
    />
  );
};

Modal.CloseButton = function ModalButton(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { handleClose } = useContext(ModalContext);

  return (
    <button
      {...props}
      onClick={(e) => {
        if (props.onClick) props.onClick(e);
        handleClose();
      }}
    />
  );
};

Modal.Content = function ModalContent({ children, className }) {
  const { isOpen, title, blockClose, handleClose } = useContext(ModalContext);
  const modalRef = useRef<HTMLDivElement>(null);

  const handleClickOutside = (event: React.MouseEvent<HTMLDivElement>) => {
    if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
      handleClose();
    }
  };

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div
      className="absolute top-0 w-screen h-screen bg-secondary/10 backdrop-blur-md flex items-center justify-center animate-in fade-in ease-in-out"
      onClick={handleClickOutside}
    >
      <div className={`max-w-screen max-h-screen space-y-2 ${className} p-5 pt-12`} ref={modalRef}>
        <div className="w-full h-full card shadow-2xl pointer-events-auto">
          <div className="absolute top-0 -translate-y-full w-full flex justify-between items-center p-2">
            <p className="font-bold uppercase pr-2 text-accent">{title}</p>
            {!blockClose && (
              <button onClick={handleClose} className="btn-sm ghost">
                X
              </button>
            )}
          </div>
          {children}
        </div>
      </div>
    </div>,
    document.getElementById("modal-root")!
  );
};
