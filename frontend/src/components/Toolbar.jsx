import { useTheme } from "../context/ThemeContext";
import { Play, Scissors, Clipboard, ClipboardPaste, Save, Trash2, Settings } from "lucide-react";

const Toolbar = ({ onRun, onCut, onCopy, onPaste, onSave, onDelete }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="toolbar">
      <button onClick={onRun}><Play size={18}/> Run</button>
      <button onClick={onCut}><Scissors size={18}/> Cut</button>
      <button onClick={onCopy}><Clipboard size={18}/> Copy</button>
      <button onClick={onPaste}><ClipboardPaste size={18}/> Paste</button>
      <button onClick={onSave}><Save size={18}/> Save</button>
      <button onClick={onDelete}><Trash2 size={18}/> Delete</button>

      <div className="spacer"></div>

      <button onClick={toggleTheme}><Settings size={18}/> {theme}</button>
    </div>
  );
};

export default Toolbar;
