export type WorkSpaceRoom = {
    id: number,
    title: string,
    description: string,
    roomType: string,
    pricePerHour: number,
    pricePerDay: number,
    pricePerMonth: number,
    capacity: number,
    area: number, // diện tích

}

export interface Amenity {
  id: number;
  name: string;
  description: string;
  iconClass: string;
  isAvailable: boolean;
}

export interface WorkSpaceRoomDetail {
  id: number;
  title: string;
  description: string;
  workSpaceRoomType: string;
  pricePerHour: number;
  pricePerDay: number;
  pricePerMonth: number;
  capacity: number;
  area: number;
  images: string[];
  amenities: Amenity[];
}

