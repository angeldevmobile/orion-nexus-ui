import React from "react";

interface Tab {
  path: string;
}

interface FileTabsProps {
  tabs: Tab[];
  active: string;
  onSelect: (path: string) => void;
  onClose: (path: string) => void;
}

export const FileTabs: React.FC<FileTabsProps> = ({
  tabs,
  active,
  onSelect,
  onClose,
}) => {
  return (
    <div className="flex bg-[#1e1e1e] border-b border-[#333]">
      {tabs.map((tab) => (
        <div
          key={tab.path}
          className={`px-4 py-2 cursor-pointer flex items-center gap-2 ${
            active === tab.path
              ? "bg-[#252526] text-white"
              : "text-gray-400 hover:text-white"
          }`}
          onClick={() => onSelect(tab.path)}
        >
          <span>{tab.path.split("/").pop()}</span>
          <button
            className="text-gray-500 hover:text-white"
            onClick={(e) => {
              e.stopPropagation();
              onClose(tab.path);
            }}
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
};

export default FileTabs;
