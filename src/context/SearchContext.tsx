// File: src/context/SearchContext.tsx (Đã sửa)

import React, { createContext, useContext, useState, ReactNode } from 'react';

// === TYPES ===
export type BookingType = 'hourly' | 'daily';

export interface SelectedTimeState {
    date: Date | null;     
    startTime: Date | null; 
    endTime: Date | null;   
    displayText: string;     
}

export interface SearchState {
    location: string;
    selectedTime: SelectedTimeState;
    participants: number;
    bookingType: BookingType;
    // === [ĐÃ THÊM] AMENITIES CHO SEARCH STATE ===
    selectedAmenities: string[]; 
}

export interface SearchContextType {
    searchState: SearchState;
    setLocation: (location: string) => void;
    setSelectedTime: (time: SelectedTimeState) => void;
    setParticipants: (participants: number) => void;
    setBookingType: (type: BookingType) => void;
    // === [ĐÃ THÊM] Set Amenities (Không dùng trong bài này nhưng nên có) ===
    setSelectedAmenities: (amenities: string[]) => void;
    resetSearch: () => void;
}

// === GIÁ TRỊ MẶC ĐỊNH ===
const initialTime: SelectedTimeState = {
    date: null,
    startTime: null,
    endTime: null,
    displayText: "Chọn ngày và giờ làm việc",
};

const defaultSearchState: SearchState = {
    location: '',
    selectedTime: initialTime,
    participants: 1,
    bookingType: 'hourly',
    // === [ĐÃ THÊM] Khởi tạo Amenities ===
    selectedAmenities: [], 
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
        resetSearch,
    };

    return (
        <SearchContext.Provider value={contextValue}>
            {children}
        </SearchContext.Provider>
    );
};

// === CUSTOM HOOK ===
export const useSearch = (): SearchContextType => {
    const context = useContext(SearchContext);
    if (context === undefined) {
        throw new Error('useSearch must be used within a SearchProvider');
    }
    return context;
};