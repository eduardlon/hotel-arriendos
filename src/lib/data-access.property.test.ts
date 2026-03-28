import { describe, it, expect, beforeEach } from 'vitest';
import * as fc from 'fast-check';
import {
  getRooms,
  createRoom,
  updateRoom,
  deleteRoom,
} from './data-access';
import type { Room } from '@/types';

/**
 * **Feature: hotel-arriendos, Property 2: Room CRUD Operations**
 * 
 * For any valid room data (number, type, floor, price, status), creating a room should add it
 * to the system, updating a room should modify its attributes, and deleting a room should remove
 * it from the system, with all operations immediately reflected in the UI.
 * 
 * **Validates: Requirements 3.4, 3.5**
 */
describe('Property 2: Room CRUD Operations', () => {
  // Arbitrary generators for room data
  const roomNumberArbitrary = fc.oneof(
    fc.integer({ min: 100, max: 999 }).map(n => n.toString()),
    fc.constantFrom('A', 'B', 'C', 'D')
      .chain(letter => fc.integer({ min: 1, max: 50 }).map(n => `${letter}${n}`))
  );

  const roomTypeArbitrary = fc.constantFrom<Room['type']>(
    'individual',
    'doble',
    'suite',
    'familiar'
  );

  const floorArbitrary = fc.integer({ min: 1, max: 20 });

  const priceArbitrary = fc.float({ min: 10, max: 1000, noNaN: true }).map(p => 
    Math.round(p * 100) / 100
  );

  const roomStatusArbitrary = fc.constantFrom<Room['status']>(
    'disponible',
    'ocupada',
    'limpieza',
    'mantenimiento'
  );

  const roomDataArbitrary = fc.record({
    number: roomNumberArbitrary,
    type: roomTypeArbitrary,
    floor: floorArbitrary,
    price: priceArbitrary,
    status: roomStatusArbitrary,
  });

  beforeEach(async () => {
    // Clear all rooms before each test
    const rooms = await getRooms();
    for (const room of rooms) {
      await deleteRoom(room.id);
    }
  });

  it('should create a room with any valid room data and add it to the system', async () => {
    await fc.assert(
      fc.asyncProperty(
        roomDataArbitrary,
        async (roomData) => {
          // Get initial room count
          const initialRooms = await getRooms();
          const initialCount = initialRooms.length;

          // Create room
          const createdRoom = await createRoom(roomData);

          // Verify room was created with correct data
          expect(createdRoom).toBeDefined();
          expect(createdRoom.id).toBeDefined();
          expect(createdRoom.number).toBe(roomData.number);
          expect(createdRoom.type).toBe(roomData.type);
          expect(createdRoom.floor).toBe(roomData.floor);
          expect(createdRoom.price).toBe(roomData.price);
          expect(createdRoom.status).toBe(roomData.status);

          // Verify room was added to the system
          const updatedRooms = await getRooms();
          expect(updatedRooms.length).toBe(initialCount + 1);

          // Verify the created room is in the system
          const foundRoom = updatedRooms.find(r => r.id === createdRoom.id);
          expect(foundRoom).toBeDefined();
          expect(foundRoom).toEqual(createdRoom);

          return true;
        }
      ),
      { numRuns: 10 }
    );
  }, 15000);

  it('should update a room with any valid attribute changes', async () => {
    await fc.assert(
      fc.asyncProperty(
        roomDataArbitrary,
        roomDataArbitrary,
        async (initialData, updateData) => {
          // Create initial room
          const createdRoom = await createRoom(initialData);

          // Update room with new data
          const updatedRoom = await updateRoom(createdRoom.id, updateData);

          // Verify update was successful
          expect(updatedRoom).toBeDefined();
          expect(updatedRoom!.id).toBe(createdRoom.id);
          expect(updatedRoom!.number).toBe(updateData.number);
          expect(updatedRoom!.type).toBe(updateData.type);
          expect(updatedRoom!.floor).toBe(updateData.floor);
          expect(updatedRoom!.price).toBe(updateData.price);
          expect(updatedRoom!.status).toBe(updateData.status);

          // Verify changes are reflected in the system
          const rooms = await getRooms();
          const foundRoom = rooms.find(r => r.id === createdRoom.id);
          expect(foundRoom).toEqual(updatedRoom);

          return true;
        }
      ),
      { numRuns: 10 }
    );
  }, 15000);

  it('should delete a room and remove it from the system', async () => {
    await fc.assert(
      fc.asyncProperty(
        roomDataArbitrary,
        async (roomData) => {
          // Create room
          const createdRoom = await createRoom(roomData);

          // Get room count before deletion
          const beforeDelete = await getRooms();
          const countBeforeDelete = beforeDelete.length;

          // Verify room exists
          expect(beforeDelete.find(r => r.id === createdRoom.id)).toBeDefined();

          // Delete room
          const deleteResult = await deleteRoom(createdRoom.id);
          expect(deleteResult).toBe(true);

          // Verify room was removed from the system
          const afterDelete = await getRooms();
          expect(afterDelete.length).toBe(countBeforeDelete - 1);
          expect(afterDelete.find(r => r.id === createdRoom.id)).toBeUndefined();

          return true;
        }
      ),
      { numRuns: 10 }
    );
  }, 15000);

  it('should handle partial updates to room attributes', async () => {
    await fc.assert(
      fc.asyncProperty(
        roomDataArbitrary,
        fc.oneof(
          fc.record({ price: priceArbitrary }),
          fc.record({ status: roomStatusArbitrary }),
          fc.record({ floor: floorArbitrary }),
          fc.record({ type: roomTypeArbitrary })
        ),
        async (initialData, partialUpdate) => {
          // Create initial room
          const createdRoom = await createRoom(initialData);

          // Apply partial update
          const updatedRoom = await updateRoom(createdRoom.id, partialUpdate);

          // Verify partial update was applied
          expect(updatedRoom).toBeDefined();
          expect(updatedRoom!.id).toBe(createdRoom.id);

          // Verify updated fields changed
          for (const [key, value] of Object.entries(partialUpdate)) {
            expect(updatedRoom![key as keyof Room]).toBe(value);
          }

          // Verify non-updated fields remained the same
          const unchangedFields = Object.keys(initialData).filter(
            key => !(key in partialUpdate)
          );
          for (const field of unchangedFields) {
            expect(updatedRoom![field as keyof Room]).toBe(createdRoom[field as keyof Room]);
          }

          return true;
        }
      ),
      { numRuns: 10 }
    );
  }, 15000);

  it('should maintain data integrity across multiple CRUD operations', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(roomDataArbitrary, { minLength: 3, maxLength: 5 }),
        async (roomDataArray) => {
          const createdRooms: Room[] = [];

          // Create multiple rooms
          for (const roomData of roomDataArray) {
            const room = await createRoom(roomData);
            createdRooms.push(room);
          }

          // Verify all rooms were created
          const allRooms = await getRooms();
          for (const createdRoom of createdRooms) {
            const found = allRooms.find(r => r.id === createdRoom.id);
            expect(found).toBeDefined();
            expect(found).toEqual(createdRoom);
          }

          // Update half of the rooms
          const roomsToUpdate = createdRooms.slice(0, Math.floor(createdRooms.length / 2));
          for (const room of roomsToUpdate) {
            await updateRoom(room.id, { status: 'limpieza' });
          }

          // Verify updates
          const afterUpdate = await getRooms();
          for (const room of roomsToUpdate) {
            const found = afterUpdate.find(r => r.id === room.id);
            expect(found?.status).toBe('limpieza');
          }

          // Delete half of the remaining rooms
          const roomsToDelete = createdRooms.slice(Math.floor(createdRooms.length / 2));
          for (const room of roomsToDelete) {
            await deleteRoom(room.id);
          }

          // Verify deletions
          const afterDelete = await getRooms();
          for (const room of roomsToDelete) {
            expect(afterDelete.find(r => r.id === room.id)).toBeUndefined();
          }

          // Verify remaining rooms are still intact
          const remainingRooms = createdRooms.slice(0, Math.floor(createdRooms.length / 2));
          for (const room of remainingRooms) {
            const found = afterDelete.find(r => r.id === room.id);
            expect(found).toBeDefined();
          }

          return true;
        }
      ),
      { numRuns: 5 }
    );
  }, 20000);

  it('should generate unique IDs for each created room', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(roomDataArbitrary, { minLength: 3, maxLength: 8 }),
        async (roomDataArray) => {
          const createdRooms: Room[] = [];

          // Create multiple rooms
          for (const roomData of roomDataArray) {
            const room = await createRoom(roomData);
            createdRooms.push(room);
          }

          // Verify all IDs are unique
          const ids = createdRooms.map(r => r.id);
          const uniqueIds = new Set(ids);
          expect(uniqueIds.size).toBe(ids.length);

          return true;
        }
      ),
      { numRuns: 10 }
    );
  }, 20000);

  it('should return null when updating non-existent room', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 10, maxLength: 50 }),
        roomDataArbitrary,
        async (nonExistentId, updateData) => {
          // Try to update a room that doesn't exist
          const result = await updateRoom(nonExistentId, updateData);

          // Verify update failed gracefully
          expect(result).toBeNull();

          return true;
        }
      ),
      { numRuns: 10 }
    );
  }, 15000);

  it('should return false when deleting non-existent room', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 10, maxLength: 50 }),
        async (nonExistentId) => {
          // Try to delete a room that doesn't exist
          const result = await deleteRoom(nonExistentId);

          // Verify deletion failed gracefully
          expect(result).toBe(false);

          return true;
        }
      ),
      { numRuns: 10 }
    );
  }, 15000);

  it('should preserve all room attributes through create-read cycle', async () => {
    await fc.assert(
      fc.asyncProperty(
        roomDataArbitrary,
        async (roomData) => {
          // Create room
          const createdRoom = await createRoom(roomData);

          // Read room back from system
          const allRooms = await getRooms();
          const retrievedRoom = allRooms.find(r => r.id === createdRoom.id);

          // Verify all attributes are preserved
          expect(retrievedRoom).toBeDefined();
          expect(retrievedRoom!.number).toBe(roomData.number);
          expect(retrievedRoom!.type).toBe(roomData.type);
          expect(retrievedRoom!.floor).toBe(roomData.floor);
          expect(retrievedRoom!.price).toBe(roomData.price);
          expect(retrievedRoom!.status).toBe(roomData.status);

          return true;
        }
      ),
      { numRuns: 10 }
    );
  }, 15000);

  it('should handle rooms with optional assignedEmployeeId field', async () => {
    await fc.assert(
      fc.asyncProperty(
        roomDataArbitrary,
        fc.option(fc.string({ minLength: 5, maxLength: 20 }), { nil: undefined }),
        async (roomData, employeeId) => {
          // Create room with optional employee assignment
          const roomWithEmployee = {
            ...roomData,
            assignedEmployeeId: employeeId,
          };

          const createdRoom = await createRoom(roomWithEmployee);

          // Verify employee assignment
          expect(createdRoom.assignedEmployeeId).toBe(employeeId);

          // Verify it's retrievable
          const rooms = await getRooms();
          const found = rooms.find(r => r.id === createdRoom.id);
          expect(found?.assignedEmployeeId).toBe(employeeId);

          return true;
        }
      ),
      { numRuns: 10 }
    );
  }, 15000);

  it('should handle rooms with optional lastCleaned field', async () => {
    await fc.assert(
      fc.asyncProperty(
        roomDataArbitrary,
        fc.option(fc.date({ min: new Date('2020-01-01'), max: new Date('2025-12-31') }), { nil: undefined }),
        async (roomData, lastCleaned) => {
          // Create room with optional lastCleaned date
          const roomWithDate = {
            ...roomData,
            lastCleaned,
          };

          const createdRoom = await createRoom(roomWithDate);

          // Verify lastCleaned date
          expect(createdRoom.lastCleaned).toEqual(lastCleaned);

          // Verify it's retrievable
          const rooms = await getRooms();
          const found = rooms.find(r => r.id === createdRoom.id);
          expect(found?.lastCleaned).toEqual(lastCleaned);

          return true;
        }
      ),
      { numRuns: 10 }
    );
  }, 15000);

  it('should support updating room status independently', async () => {
    await fc.assert(
      fc.asyncProperty(
        roomDataArbitrary,
        fc.array(roomStatusArbitrary, { minLength: 2, maxLength: 3 }),
        async (roomData, statusSequence) => {
          // Create room
          const createdRoom = await createRoom(roomData);

          // Apply sequence of status updates
          let currentRoom = createdRoom;
          for (const newStatus of statusSequence) {
            const updated = await updateRoom(currentRoom.id, { status: newStatus });
            expect(updated).toBeDefined();
            expect(updated!.status).toBe(newStatus);
            currentRoom = updated!;
          }

          // Verify final status
          const rooms = await getRooms();
          const finalRoom = rooms.find(r => r.id === createdRoom.id);
          expect(finalRoom?.status).toBe(statusSequence[statusSequence.length - 1]);

          return true;
        }
      ),
      { numRuns: 10 }
    );
  }, 20000);
});
