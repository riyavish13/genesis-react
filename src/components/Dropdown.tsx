import {
  useEffect,
  useState,
  useMemo,
  useCallback,
  forwardRef,
  useRef,
  useImperativeHandle,
} from "react";
import {
  RiArrowDownSLine,
  RiSearchLine,
  RiErrorWarningLine,
} from "@remixicon/react";
import Input from "./Input";
import Label from "./Label";
import Checkbox from "./Checkbox";
import Tooltip from "./Tooltip";
import { cn } from "../utils";

type Option = {
  label: string;
  value: string;
  info?: string;
  addInfo?: string;
  tooltipContent?: string;
  disabledOption?: boolean;
};

interface MenuItemProps {
  label?: string;
  value: string;
  children?: React.ReactNode;
}

interface DropdownProps {
  icon?: JSX.Element;
  options: Option[];
  selected?: Option[];
  setSelected?: React.Dispatch<React.SetStateAction<Option[]>>;
  onApply?: () => void;
  onReset?: () => void;
  dropdownText?: string;
  search?: boolean;
  multiple?: boolean;
  renderItem?: (option: Option) => React.ReactNode;
  children?: React.ReactNode;
  position?: "top" | "bottom";
  info?: string | number;
  addInfo?: string | number;
  tooltipContent?: string;
  width?: string;
  dropDownTooltip?: boolean | undefined;
  dropdownFooter?: boolean | undefined;
  disabled?: boolean;
}

const defaultRenderItem = (option: Option) => {
  return <MenuItem label={option.label} value={option.value} />;
};

const Dropdown = forwardRef<HTMLDivElement, DropdownProps>(
  (
    {
      options,
      selected,
      setSelected,
      search = false,
      multiple = false,
      dropdownText = "Select",
      renderItem = defaultRenderItem,
      children,
      icon,
      position = "top",
      width,
      info,
      dropDownTooltip = false,
      dropdownFooter = false,
      onApply,
      disabled = false,
      onReset,
    },
    ref
  ) => {
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [filteredOptions, setFilteredOptions] = useState<Option[]>(
      options || []
    );

    const [dropdownMenu, setDropdownMenu] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useImperativeHandle(ref, () => dropdownRef.current!);

    useEffect(() => {
      if (options) {
        setFilteredOptions(options);
      }
    }, [options]);

    const memoizedFilteredOptions = useMemo(() => {
      if (!search) return filteredOptions;
      return filteredOptions.filter((option) =>
        option.label.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }, [search, searchQuery, filteredOptions]);

    const handleSearchChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
      },
      []
    );

    const toggleOption = useCallback(
      (option: Option) => {
        if (multiple && setSelected) {
          setSelected((prevSelected) =>
            prevSelected.some((item) => item.value === option.value)
              ? prevSelected.filter((item) => item.value !== option.value)
              : [...prevSelected, option]
          );
        } else if (setSelected) {
          setSelected([option]);
          setDropdownMenu(false);
        }
      },
      [multiple, setSelected]
    );

    const handleCheckboxChange = useCallback(
      (option: Option) => {
        if (multiple && setSelected) {
          setSelected((prevSelected) =>
            prevSelected.some((item) => item.value === option.value)
              ? prevSelected.filter((item) => item.value !== option.value)
              : [...prevSelected, option]
          );
        } else if (setSelected) {
          setSelected([option]);
        }
      },
      [multiple, setSelected]
    );

    const handleSelectAll = () => {
      if (selected?.length === filteredOptions.length) {
        setSelected?.([]);
      } else {
        setSelected?.(filteredOptions);
      }
    };

    const handleReset = () => {
      if (onReset) {
        onReset();
      }
      setSelected?.([]);
      setDropdownMenu(false);
    };

    useEffect(() => {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, []);

    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownMenu(false);
      }
    };

    // width adjustment

    const numericWidth = width ? parseInt(width, 10) : 0;
    const adjustedWidth = numericWidth - 50;

    return (
      <div
        ref={dropdownRef}
        // className={cn("relative", !width && "w-full")}
        className={cn(
          "relative bg-gray-25 shadow-[0px_1px_2px_0px_#1018280D] rounded-lg",
          !width && "w-full",
          disabled && "cursor-not-allowed opacity-50"
        )}
        style={{
          width: width,
        }}
      >
        <div
          // onClick={() => setDropdownMenu((prev) => !prev)}
          onClick={() => !disabled && setDropdownMenu((prev) => !prev)}
          className={cn(
            "hover:bg-gray-50 py-2 px-[14px] rounded-lg flex justify-between items-center text-gray-900 bg-gray-25 text-text-sm cursor-pointer",
            dropdownMenu ? "border border-gray-800" : "border border-gray-200",
            disabled && "bg-gray-300 hover:bg-gray-300 cursor-not-allowed"
          )}
        >
          <section
            className={cn(
              "flex items-center gap-2 text-ellipsis overflow-hidden"
            )}
            style={{ width: `${adjustedWidth}px` }}
          >
            {icon && <span>{icon}</span>}
            <p className="line-clamp-1 w-full">
              {multiple
                ? (selected?.length ?? 0) > 0
                  ? `${selected?.length} Selected`
                  : dropdownText
                : selected?.[0]?.label
                ? selected?.[0]?.label
                : dropdownText}
            </p>
          </section>
          <RiArrowDownSLine size={18} />
        </div>
        <ul
          className={cn(
            "max-h-0 opacity-0 overflow-hidden shadow-sm mt-1 rounded absolute text-[16px] bg-white z-[1000] w-full transition-all duration-75 delay-100 ease-in",
            position === "top" ? "top-10" : "bottom-10",
            dropdownMenu &&
              "max-h-[320px] opacity-[1] transition-all ease-in duration-150"
          )}
        >
          {search && (
            <Input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="rounded rounded-b-none text-gray-800 bg-white w-full h-[35px] pl-3"
              endIcon={<RiSearchLine size={18} />}
            />
          )}
          {multiple && (
            <section className="py-[6px] px-[14px] flex justify-between items-center">
              <p
                onClick={handleSelectAll}
                className="text-text-sm  hover:text-primary-700 text-primary-600 cursor-pointer"
              >
                Select all
              </p>
              <button
                className="text-text-sm text-warning-500 hover:text-warning-600"
                onClick={handleReset}
              >
                Reset
              </button>
            </section>
          )}
          <section className="max-h-[200px] transition-all duration-75 delay-100 ease-in-out overflow-y-scroll">
            {options
              ? memoizedFilteredOptions.map((option, i) => (
                  <div key={i}>
                    {multiple ? (
                      <Label
                        className={cn(
                          "has-[:checked]:bg-primary-50 has-[:checked]:border-primary-600 hover:bg-gray-50 flex flex-col py-[6px] px-[14px] cursor-pointer border-l-4 border-transparent",
                          option?.disabledOption &&
                            "opacity-50 cursor-not-allowed hover:bg-white text-gray-300 select-none"
                        )}
                        htmlFor={`checkbox-${option.value}`}
                        key={i}
                      >
                        <section className="flex items-center justify-between gap-2 w-full">
                          <div className="flex gap-2">
                            <Checkbox
                              id={`checkbox-${option.value}`}
                              checked={
                                selected?.some(
                                  (item) => item.value === option.value
                                ) ?? false
                              }
                              disabled={option?.disabledOption}
                              onChange={() => handleCheckboxChange(option)}
                            />
                            <div className="flex items-center gap-1">
                              <span>{renderItem(option)}</span>
                              {dropDownTooltip && (
                                <DropdownTooltip
                                  tooltipContent={option?.tooltipContent}
                                />
                              )}
                            </div>
                          </div>
                          <span className="text-gray-500">{option?.info}</span>
                        </section>
                        <span className="pt-[2px] text-text-sm text-gray-500">
                          {option?.addInfo}
                        </span>
                      </Label>
                    ) : (
                      <Label
                        key={i}
                        className={cn(
                          "flex justify-between py-[6px] px-[14px] hover:bg-gray-50 gap-2 items-center border-l-4 border-transparent cursor-pointer",
                          {
                            "bg-primary-50 border-primary-600":
                              selected && selected[0]?.value === option.value,
                            "opacity-50 cursor-not-allowed hover:bg-white text-gray-500":
                              option?.disabledOption,
                          }
                        )}
                        onClick={() =>
                          !option?.disabledOption && toggleOption(option)
                        }
                      >
                        <div className="flex items-center gap-1">
                          <span>{renderItem(option)}</span>
                          {dropDownTooltip && (
                            <DropdownTooltip
                              tooltipContent={option?.tooltipContent}
                            />
                          )}
                        </div>
                        <span className="text-gray-500">{info}</span>
                      </Label>
                    )}
                  </div>
                ))
              : children}
          </section>
          {dropdownFooter && (
            <DropdownFooter
              setDropdownMenu={setDropdownMenu}
              onApply={onApply}
            />
          )}
        </ul>
      </div>
    );
  }
);

export const MenuItem: React.FC<MenuItemProps> = ({ label, children }) => {
  return <p className="break-all">{label || children}</p>;
};

interface DropdownTooltipProps {
  tooltipContent?: string | undefined;
}

const DropdownTooltip: React.FC<DropdownTooltipProps> = ({
  tooltipContent,
}) => {
  const content = tooltipContent || "";
  return content ? (
    <Tooltip position="right" content={content}>
      <RiErrorWarningLine color="#98A2B3" size={14} />
    </Tooltip>
  ) : null;
};

interface DropdownFooterProps {
  onApply?: (() => void) | undefined;
  setDropdownMenu?: any;
}

export const DropdownFooter: React.FC<DropdownFooterProps> = ({
  // onReset,
  onApply,
  setDropdownMenu,
}) => {
  return (
    <div className="flex justify-end border-t border-gray-200 px-[14px] py-[8px] text-text-sm">
      <button
        className="text-primary-600 hover:text-primary-700"
        onClick={() => {
          if (onApply) {
            onApply();
          }
          setDropdownMenu(false);
        }}
      >
        Apply
      </button>
    </div>
  );
};

Dropdown.displayName = "Dropdown";

export default Dropdown;
