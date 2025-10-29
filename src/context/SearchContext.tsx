// File: src/context/SearchContext.tsx

import React, { createContext, useContext, useState, ReactNode } from 'react';

// === TYPES ===
export type BookingType = 'hourly' | 'daily';

export interface SelectedTimeState {
    date: Date | null;       // Ngày bắt đầu (hoặc ngày duy nhất)
    startTime: Date | null;  // Thời điểm bắt đầu chính xác (bao gồm cả giờ, phút)
    endTime: Date | null;    // Thời điểm kết thúc chính xác (bao gồm cả giờ, phút)
    displayText: string;     // Chuỗi hiển thị trên Navbar
}

export interface SearchState {
    location: string;
    selectedTime: SelectedTimeState;
    participants: number;
    bookingType: BookingType;
}

export interface SearchContextType {
    searchState: SearchState;
    setLocation: (location: string) => void;
    setSelectedTime: (time: SelectedTimeState) => void;
    setParticipants: (participants: number) => void;
    setBookingType: (type: BookingType) => void;
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

    const resetSearch = () => {
        setSearchState(defaultSearchState);
    };

    const contextValue: SearchContextType = {
        searchState,
        setLocation,
        setSelectedTime,
        setParticipants,
        setBookingType,
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