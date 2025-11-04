import React, { createContext, useContext, useState, ReactNode } from 'react';

export type BookingType = 'hourly' | 'daily';

export interface SelectedTimeState {
    date: Date | null; 
    startTime: Date | null; 
    endTime: Date | null; 
    displayText: string; 
    dates?: Date[]; 
}

export interface SearchState {
    location: string;
    selectedTime: SelectedTimeState;
    participants: number;
    bookingType: BookingType;
    selectedAmenities: string[]; 
    minPrice: number; 
    maxPrice: number; 
}

export interface SearchContextType {
    searchState: SearchState;
    setLocation: (location: string) => void;
    setSelectedTime: (time: SelectedTimeState) => void;
    setParticipants: (participants: number) => void;
    setBookingType: (type: BookingType) => void;
    setSelectedAmenities: (amenities: string[]) => void;
    setMinMaxPrice: (min: number, max: number) => void;
    resetSearch: () => void;
}

// === GIÁ TRỊ MẶC ĐỊNH ===
const initialTime: SelectedTimeState = {
    date: null,
    startTime: null,
    endTime: null,
    displayText: "Chọn ngày và giờ làm việc",
};

// Đặt giới hạn giá trị mặc định cho Range Slider
const DEFAULT_MIN_PRICE = 100000;
const DEFAULT_MAX_PRICE = 5000000;

const defaultSearchState: SearchState = {
    location: '',
    selectedTime: initialTime,
    participants: 1,
    bookingType: 'hourly',
    selectedAmenities: [], 
    // === [ĐÃ THÊM] Khởi tạo Price Filters ===
    minPrice: DEFAULT_MIN_PRICE, 
    maxPrice: DEFAULT_MAX_PRICE,
};

const SearchContext = createContext<SearchContextType | undefined>(undefined);

// === PROVIDER COMPONENT ===
interface SearchProviderProps {
    children: ReactNode;
}

export const SearchProvider: React.FC<SearchProviderProps> = ({ children }) => {
    const [searchState, setSearchState] = useState<SearchState>(defaultSearchState);

    const setLocation = (location: string) => {
        setSearchState(prev => ({ ...prev, location }));
    };

    const setSelectedTime = (time: SelectedTimeState) => {
        setSearchState(prev => ({ ...prev, selectedTime: time }));
    };

    const setParticipants = (participants: number) => {
        setSearchState(prev => ({ ...prev, participants }));
    };
    
    const setBookingType = (type: BookingType) => {
        setSearchState(prev => ({ ...prev, bookingType: type }));
    };

    const setSelectedAmenities = (amenities: string[]) => {
        setSearchState(prev => ({ ...prev, selectedAmenities: amenities }));
    };
    
    const setMinMaxPrice = (min: number, max: number) => {
        setSearchState(prev => ({ ...prev, minPrice: min, maxPrice: max }));
    };

    const resetSearch = () => {
        setSearchState(defaultSearchState);
    };

    const contextValue: SearchContextType = {
        searchState,
        setLocation,
        setSelectedTime,
        setParticipants,
        setBookingType,
        setSelectedAmenities,
        setMinMaxPrice, 
        resetSearch,
    };

    return (
        <SearchContext.Provider value={contextValue}>
            {children}
        </SearchContext.Provider>
    );
};

export const useSearch = (): SearchContextType => {
    const context = useContext(SearchContext);
    if (context === undefined) {
        throw new Error('useSearch must be used within a SearchProvider');
    }
    return context;
};