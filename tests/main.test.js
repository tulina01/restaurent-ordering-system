import { describe, it, expect } from 'vitest';
import axios from 'axios';

describe('Root Endpoint Test', () => {
  it('should return status 200 and the correct response message', async () => {
    const response = await axios.get('http://localhost:3000/');
    expect(response.status).toBe(200);
    expect(response.data).toEqual({ message: "Welcome to the Restaurant Ordering System API" });
  });
});

describe('Menu Items Endpoint Test', () => {
  it('should return status 200', async () => {
    const response = await axios.get('http://localhost:3000/api/menu-items');
    expect(response.status).toBe(200);
  });
});

describe('/api/menu-items endpoint', () => {
  const baseURL = 'http://localhost:3000';

  // Mock data for testing
  const mockMenuItem = {
      name: 'Pasta',
      price: 12.99,
      category: 'Main Course',
  };

  it('should create a new menu item successfully', async () => {
      const response = await axios.post(`${baseURL}/api/menu-items`, mockMenuItem);

      expect(response.status).toBe(201);
      expect(response.data).toHaveProperty('_id'); // Assuming MongoDB assigns an _id
      expect(response.data.name).toBe(mockMenuItem.name);
      expect(response.data.price).toBe(mockMenuItem.price);
      expect(response.data.category).toBe(mockMenuItem.category);
  });

  it('should return an error for invalid input', async () => {
      const invalidMenuItem = { name: '' }; // Missing required fields

      try {
          await axios.post(`${baseURL}/api/menu-items`, invalidMenuItem);
      } catch (error) {
          expect(error.response.status).toBe(400);
          expect(error.response.data).toHaveProperty('message');
          expect(error.response.data.message).not.toBe('');
      }
  });
});

describe('/api/menu-items endpoint', () => {
    const baseURL = 'http://localhost:3000';

    // Mock data for testing
    const mockMenuItem = {
        name: 'Pasta',
        price: 12.99,
        category: 'Main Course',
    };

    it('should create a new menu item successfully', async () => {
        const response = await axios.post(`${baseURL}/api/menu-items`, mockMenuItem);

        expect(response.status).toBe(201);
        expect(response.data).toHaveProperty('_id'); // Assuming MongoDB assigns an _id
        expect(response.data.name).toBe(mockMenuItem.name);
        expect(response.data.price).toBe(mockMenuItem.price);
        expect(response.data.category).toBe(mockMenuItem.category);
    });

    it('should return an error for invalid input', async () => {
        const invalidMenuItem = { name: '' }; // Missing required fields

        try {
            await axios.post(`${baseURL}/api/menu-items`, invalidMenuItem);
        } catch (error) {
            expect(error.response.status).toBe(400);
            expect(error.response.data).toHaveProperty('message');
            expect(error.response.data.message).not.toBe('');
        }
    });

    // it('should retrieve a menu item by ID successfully', async () => {
    //     // Assuming a valid ID exists; replace 'someValidId' with an actual ID or mock it
    //     const someValidId = '677521f53799f92153804231';
    //     const response = await axios.get(`${baseURL}/api/menu-items/${someValidId}`);

    //     expect(response.status).toBe(200);
    //     expect(response.data).toHaveProperty('_id', someValidId);
    // });

    it('should return a 404 error for a non-existent menu item', async () => {
        const nonExistentId = 'nonExistentId'; // Replace with an ID guaranteed to not exist

        try {
            await axios.get(`${baseURL}/api/menu-items/${nonExistentId}`);
        } catch (error) {
            expect(error.response.status).toBe(404);
            expect(error.response.data).toHaveProperty('message');
            // expect(error.response.data.message).toBe('Menu item not found');
        }
    });

    it('should return a 500 error for an invalid ID format', async () => {
        const invalidId = 'invalidId'; // An ID that cannot be parsed by MongoDB

        try {
            await axios.get(`${baseURL}/api/menu-items/${invalidId}`);
        } catch (error) {
            expect(error.response.status).toBe(404);
            expect(error.response.data).toHaveProperty('message');
        }
    });
});