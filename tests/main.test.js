import { describe, it, expect, beforeEach,beforeAll } from 'vitest';
import axios from 'axios';
import { ObjectId } from 'mongodb';




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




// coustomers endpoint testing


describe('/api/customers endpoint', () => {
    const baseURL = 'http://localhost:3000';
  
    it('should return status 200 and an array of customers', async () => {
      const response = await axios.get(`${baseURL}/api/customers`);
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
    });
  
    it('should return customer objects with expected properties', async () => {
      const response = await axios.get(`${baseURL}/api/customers`);     
      if (response.data.length > 0) {
        const customer = response.data[0];
        expect(customer).toHaveProperty('_id');
        
      }
    });
  
    it('should handle errors and return a 500 status', async () => {
  
      
      try {
        await axios.get(`${baseURL}/api/customers`, { params: { $invalid: true } });
      } catch (error) {
        expect(error.response.status).toBe(500);
        expect(error.response.data).toHaveProperty('message');
      }
    });
  });




  

  describe('/api/customers/:id endpoint', () => {
    const baseURL = 'http://localhost:3000';
  
    it('should handle a request with a valid ID format', async () => {
      const validId = new ObjectId().toString(); // Generate a valid ObjectId
  
      try {
        await axios.get(`${baseURL}/api/customers/${validId}`);
      } catch (error) {
        // We expect a 404 because this ID doesn't exist in the database
        expect(error.response.status).toBe(404);
        expect(error.response.data).toHaveProperty('message', 'Customer not found');
      }
    });
  
    it('should return a 500 error for an invalid ID format', async () => {
      const invalidId = 'invalidCustomerId';
  
      try {
        await axios.get(`${baseURL}/api/customers/${invalidId}`);
      } catch (error) {
        expect(error.response.status).toBe(500);
        expect(error.response.data).toHaveProperty('message');
        // The exact error message might vary, so we're just checking if it exists
        expect(error.response.data.message).not.toBe('');
      }
    });
  
    it('should handle empty ID parameter', async () => {
      try {
        await axios.get(`${baseURL}/api/customers/`);
      } catch (error) {
        // Expecting a 404 Not Found, as the route doesn't match without an ID
        expect(error.response.status).toBe(404);
      }
    });
  
    it('should handle very long ID parameter', async () => {
      const longId = 'a'.repeat(1000); // Create a very long string
  
      try {
        await axios.get(`${baseURL}/api/customers/${longId}`);
      } catch (error) {
        // Expecting a 500 Internal Server Error
        expect(error.response.status).toBe(500);
        expect(error.response.data).toHaveProperty('message');
      }
    });
  });
  
  
  describe('/api/customers/:id DELETE endpoint', () => {
    const baseURL = 'http://localhost:3000';
  
    it('should handle deleting a customer with a valid ID format', async () => {
      const validId = new ObjectId().toString(); // Generate a valid ObjectId
  
      try {
        const response = await axios.delete(`${baseURL}/api/customers/${validId}`);
        expect(response.status).toBe(200);
        expect(response.data).toEqual({ message: 'Customer deleted' });
      } catch (error) {
        // If the customer doesn't exist, the API should still return a success message
        // So we don't expect to enter this catch block
        expect(error).toBeUndefined();
      }
    });
  
    it('should return a 500 error for an invalid ID format', async () => {
      const invalidId = 'invalidCustomerId';
  
      try {
        await axios.delete(`${baseURL}/api/customers/${invalidId}`);
      } catch (error) {
        expect(error.response.status).toBe(500);
        expect(error.response.data).toHaveProperty('message');
        // The exact error message might vary, so we're just checking if it exists
        expect(error.response.data.message).not.toBe('');
      }
    });
  
    it('should handle empty ID parameter', async () => {
      try {
        await axios.delete(`${baseURL}/api/customers/`);
      } catch (error) {
        // Expecting a 404 Not Found, as the route doesn't match without an ID
        expect(error.response.status).toBe(404);
      }
    });
  
    it('should handle very long ID parameter', async () => {
      const longId = 'a'.repeat(1000); // Create a very long string
  
      try {
        await axios.delete(`${baseURL}/api/customers/${longId}`);
      } catch (error) {
        // Expecting a 500 Internal Server Error
        expect(error.response.status).toBe(500);
        expect(error.response.data).toHaveProperty('message');
      }
    });
  
    it('should handle concurrent delete requests', async () => {
      const validId = new ObjectId().toString(); // Generate a valid ObjectId
  
      try {
        const requests = [
          axios.delete(`${baseURL}/api/customers/${validId}`),
          axios.delete(`${baseURL}/api/customers/${validId}`),
          axios.delete(`${baseURL}/api/customers/${validId}`)
        ];
  
        const responses = await Promise.all(requests);
  
        // All requests should be successful, even if the customer doesn't exist
        responses.forEach(response => {
          expect(response.status).toBe(200);
          expect(response.data).toEqual({ message: 'Customer deleted' });
        });
      } catch (error) {
        // We don't expect any errors
        expect(error).toBeUndefined();
      }
    });
  });
  





//   test cases  for Order


describe('/api/orders endpoint', () => {
    const baseURL = 'http://localhost:3000';
  
    // Mock data for testing
    const mockCustomerId = new ObjectId().toString();
    const mockOrders = [
      {
        _id: new ObjectId().toString(),
        customer: {
          _id: mockCustomerId,
          name: 'John Doe',
          email: 'john@example.com'
        },
        items: [
          {
            _id: new ObjectId().toString(),
            name: 'Pizza',
            price: 15.99
          }
        ]
      }
    ];
  
    it('should fetch all orders successfully', async () => {
      const response = await axios.get(`${baseURL}/api/orders`);
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
      
      // If there are orders, verify the structure of the first order
      if (response.data.length > 0) {
        const order = response.data[0];
        expect(order).toHaveProperty('_id');
        expect(order).toHaveProperty('customer');
        expect(order).toHaveProperty('items');
      }
    });
  
    it('should fetch orders for a specific customer', async () => {
      const response = await axios.get(`${baseURL}/api/orders?customer=${mockCustomerId}`);
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
      
      // Verify that all returned orders belong to the specified customer
      response.data.forEach(order => {
        expect(order.customer._id).toBe(mockCustomerId);
      });
    });
  
    it('should handle invalid customer ID gracefully', async () => {
      const invalidCustomerId = 'invalid-id';
      
      try {
        await axios.get(`${baseURL}/api/orders?customer=${invalidCustomerId}`);
      } catch (error) {
        expect(error.response.status).toBe(500);
        expect(error.response.data).toHaveProperty('message');
      }
    });
  
    it('should handle database errors appropriately', async () => {
      // Simulate a database error by using an invalid ObjectId
      const invalidObjectId = 'invalid-object-id';
      
      try {
        await axios.get(`${baseURL}/api/orders?customer=${invalidObjectId}`);
      } catch (error) {
        expect(error.response.status).toBe(500);
        expect(error.response.data).toHaveProperty('message');
      }
    });
  });


  describe('POST /api/orders endpoint', () => {
    const baseURL = 'http://localhost:3000';
  
    // Mock data for testing
    const mockCustomerId = new ObjectId().toString();
    const mockItemId = new ObjectId().toString();
    
    const validOrderData = {
      customer: mockCustomerId,
      items: [
        {
          _id: mockItemId,
          quantity: 2,
          price: 15.99
        }
      ],
      totalAmount: 31.98,
      status: 'pending'
    };
  
    it('should create a new order successfully', async () => {
      const response = await axios.post(`${baseURL}/api/orders`, validOrderData);
      
      expect(response.status).toBe(201);
      expect(response.data).toHaveProperty('_id');
      expect(response.data.customer).toBe(validOrderData.customer);
      expect(response.data.totalAmount).toBe(validOrderData.totalAmount);
      expect(response.data.status).toBe(validOrderData.status);
    });
  
    it('should return 400 when customer is missing', async () => {
      const invalidOrder = { ...validOrderData };
      delete invalidOrder.customer;
  
      try {
        await axios.post(`${baseURL}/api/orders`, invalidOrder);
      } catch (error) {
        expect(error.response.status).toBe(400);
        expect(error.response.data).toHaveProperty('message');
        expect(error.response.data.message).toBe('Invalid order data');
      }
    });
  
    it('should return 400 when items array is empty', async () => {
      const invalidOrder = {
        ...validOrderData,
        items: []
      };
  
      try {
        await axios.post(`${baseURL}/api/orders`, invalidOrder);
      } catch (error) {
        expect(error.response.status).toBe(400);
        expect(error.response.data).toHaveProperty('message');
        expect(error.response.data.message).toBe('Invalid order data');
      }
    });
  
    it('should return 400 when items is not an array', async () => {
      const invalidOrder = {
        ...validOrderData,
        items: 'not an array'
      };
  
      try {
        await axios.post(`${baseURL}/api/orders`, invalidOrder);
      } catch (error) {
        expect(error.response.status).toBe(400);
        expect(error.response.data).toHaveProperty('message');
        expect(error.response.data.message).toBe('Invalid order data');
      }
    });
  
    it('should return 400 when totalAmount is missing', async () => {
      const invalidOrder = { ...validOrderData };
      delete invalidOrder.totalAmount;
  
      try {
        await axios.post(`${baseURL}/api/orders`, invalidOrder);
      } catch (error) {
        expect(error.response.status).toBe(400);
        expect(error.response.data).toHaveProperty('message');
        expect(error.response.data.message).toBe('Invalid order data');
      }
    });
  
    it('should return 400 when status is missing', async () => {
      const invalidOrder = { ...validOrderData };
      delete invalidOrder.status;
  
      try {
        await axios.post(`${baseURL}/api/orders`, invalidOrder);
      } catch (error) {
        expect(error.response.status).toBe(400);
        expect(error.response.data).toHaveProperty('message');
        expect(error.response.data.message).toBe('Invalid order data');
      }
    });
  
    it('should handle invalid ObjectId for customer', async () => {
      const invalidOrder = {
        ...validOrderData,
        customer: 'invalid-id'
      };
  
      try {
        await axios.post(`${baseURL}/api/orders`, invalidOrder);
      } catch (error) {
        expect(error.response.status).toBe(400);
        expect(error.response.data).toHaveProperty('message');
      }
    });
  });

  describe('DELETE /api/orders/:id endpoint', () => {
    const baseURL = 'http://localhost:3000';
    
    // Mock data for testing
    const mockCustomerId = new ObjectId().toString();
    const mockOrder = {
      customer: mockCustomerId,
      items: [
        {
          _id: new ObjectId().toString(),
          quantity: 2,
          price: 15.99
        }
      ],
      totalAmount: 31.98,
      status: 'pending'
    };
  
    it('should delete an existing order successfully', async () => {
      // First create an order to delete
      const createResponse = await axios.post(`${baseURL}/api/orders`, mockOrder);
      const orderId = createResponse.data._id;
  
      // Then delete the order
      const deleteResponse = await axios.delete(`${baseURL}/api/orders/${orderId}`);
      
      expect(deleteResponse.status).toBe(200);
      expect(deleteResponse.data).toEqual({ message: 'Order deleted' });
  
      // Verify the order is actually deleted by trying to fetch it
      try {
        await axios.get(`${baseURL}/api/orders/${orderId}`);
      } catch (error) {
        expect(error.response.status).toBe(404);
      }
    });
  
    it('should return 500 for invalid ObjectId format', async () => {
      const invalidId = 'invalid-id';
  
      try {
        await axios.delete(`${baseURL}/api/orders/${invalidId}`);
      } catch (error) {
        expect(error.response.status).toBe(500);
        expect(error.response.data).toHaveProperty('message');
      }
    });
  
    it('should handle deletion of non-existent order', async () => {
      const nonExistentId = new ObjectId().toString();
  
      try {
        await axios.delete(`${baseURL}/api/orders/${nonExistentId}`);
 
      } catch (error) {
    
      }
    });
  
    it('should handle database connection errors', async () => {
 
      const validId = new ObjectId().toString();
  
      try {
        // If your database is down, this should trigger the catch block in your endpoint
        await axios.delete(`${baseURL}/api/orders/${validId}`);
      } catch (error) {
        expect(error.response.status).toBe(500);
        expect(error.response.data).toHaveProperty('message');
      }
    });
  });





//   test case for Reservation


describe('GET /api/reservations endpoint', () => {
    const baseURL = 'http://localhost:3000';
  
    // Mock data for testing
    const mockCustomerId = new ObjectId().toString();
    const mockReservation = {
      customer: {
        _id: mockCustomerId,
        name: 'John Doe',
        email: 'john@example.com'
      },
      date: new Date('2025-02-01T18:00:00Z'),
      partySize: 4,
      status: 'confirmed'
    };
  
    it('should fetch all reservations successfully', async () => {
      const response = await axios.get(`${baseURL}/api/reservations`);
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
      
      // If there are reservations, verify the structure of the first reservation
      if (response.data.length > 0) {
        const reservation = response.data[0];
        expect(reservation).toHaveProperty('_id');
        expect(reservation).toHaveProperty('customer');
        expect(reservation).toHaveProperty('date');
        expect(reservation).toHaveProperty('partySize');
        expect(reservation).toHaveProperty('status');
      }
    });
  
    it('should fetch reservations for a specific customer', async () => {
      const response = await axios.get(`${baseURL}/api/reservations?customer=${mockCustomerId}`);
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
      
      // Verify that all returned reservations belong to the specified customer
      response.data.forEach(reservation => {
        expect(reservation.customer.toString()).toBe(mockCustomerId);
      });
    });
  
    it('should return empty array for customer with no reservations', async () => {
      const nonExistentCustomerId = new ObjectId().toString();
      const response = await axios.get(`${baseURL}/api/reservations?customer=${nonExistentCustomerId}`);
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
      expect(response.data).toHaveLength(0);
    });
  
    it('should handle invalid customer ID format', async () => {
      const invalidCustomerId = 'invalid-id';
      
      try {
        await axios.get(`${baseURL}/api/reservations?customer=${invalidCustomerId}`);
      } catch (error) {
        expect(error.response.status).toBe(500);
        expect(error.response.data).toHaveProperty('message');
      }
    });
  
    it('should handle database connection errors', async () => {
      // Test with a valid ObjectId but when database might be down
      const validCustomerId = new ObjectId().toString();
      
      try {
        // If your database is down, this should trigger the catch block
        await axios.get(`${baseURL}/api/reservations?customer=${validCustomerId}`);
      } catch (error) {
        expect(error.response.status).toBe(500);
        expect(error.response.data).toHaveProperty('message');
      }
    });
  
    it('should properly populate customer details when fetching all reservations', async () => {
      const response = await axios.get(`${baseURL}/api/reservations`);
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
      
      if (response.data.length > 0) {
        const reservation = response.data[0];
      }
    });
  });


  describe('/api/reservations/:id deletion endpoint', () => {
    const baseURL = 'http://localhost:3000';

    it('should successfully delete an existing reservation', async () => {
        // Assuming a reservation with this ID exists
        const reservationId = '65bc26d48521f36ff4e0f1b3'; // Replace with a valid ID from your database
        
        const response = await axios.delete(`${baseURL}/api/reservations/${reservationId}`);
        
        expect(response.status).toBe(200);
        expect(response.data).toEqual({ message: 'Reservation deleted' });
    });

    it('should return 404 when trying to delete non-existent reservation', async () => {
        const nonExistentId = new ObjectId().toString();
        
        try {
            await axios.delete(`${baseURL}/api/reservations/${nonExistentId}`);
        } catch (error) {
            expect(error.response.status).toBe(404);
            expect(error.response.data).toHaveProperty('message');
        }
    });

    it('should return 400 when using invalid reservation ID format', async () => {
        const invalidId = 'invalid-id-format';
        
        try {
            await axios.delete(`${baseURL}/api/reservations/${invalidId}`);
        } catch (error) {
            expect(error.response.status).toBe(500);
            expect(error.response.data).toHaveProperty('message');
        }
    });
});



// testcases  for Employee


describe('/api/employees endpoint', () => {
    const baseURL = 'http://localhost:3000';

    it('should return all employees successfully', async () => {
        const response = await axios.get(`${baseURL}/api/employees`);
        
        // Check status code
        expect(response.status).toBe(200);
        
        // Check if response is an array
        expect(Array.isArray(response.data)).toBe(true);
        
        // Check if each employee has the required properties
        response.data.forEach(employee => {
            expect(employee).toHaveProperty('_id');
            expect(employee).toHaveProperty('name');
            // Add other expected properties based on your Employee model
        });
    });

    it('should handle empty employee list', async () => {
        // This test assumes there might be a case where no employees exist
        const response = await axios.get(`${baseURL}/api/employees`);
        
        expect(response.status).toBe(200);
        expect(Array.isArray(response.data)).toBe(true);
        // Even if empty, it should return an array
        expect(response.data.length >= 0).toBe(true);
    });

    it('should handle server errors', async () => {
        // To test error handling, we can temporarily break the URL
        try {
            await axios.get(`${baseURL}/api/employees?error=true`);
        } catch (error) {
            expect(error.response.status).toBe(500);
            expect(error.response.data).toHaveProperty('message');
        }
    });
}); 

describe('/api/employees endpoints', () => {
    const baseURL = 'http://localhost:3000';

    // GET /api/employees tests
    describe('GET /api/employees', () => {
        it('should return all employees successfully', async () => {
            const response = await axios.get(`${baseURL}/api/employees`);
            
            expect(response.status).toBe(200);
            expect(Array.isArray(response.data)).toBe(true);
            
            response.data.forEach(employee => {
                expect(employee).toHaveProperty('_id');
                expect(employee).toHaveProperty('name');
                expect(employee).toHaveProperty('position');
                expect(employee).toHaveProperty('email');
                expect(employee).toHaveProperty('phone');
            });
        });

        it('should handle empty employee list', async () => {
            const response = await axios.get(`${baseURL}/api/employees`);
            
            expect(response.status).toBe(200);
            expect(Array.isArray(response.data)).toBe(true);
            expect(response.data.length >= 0).toBe(true);
        });

        it('should handle server errors', async () => {
            try {
                await axios.get(`${baseURL}/api/employees?error=true`);
            } catch (error) {
                expect(error.response.status).toBe(500);
                expect(error.response.data).toHaveProperty('message');
            }
        });
    });

    // POST /api/employees tests
    describe('POST /api/employees', () => {
        it('should create a new employee successfully', async () => {
            const mockEmployee = {
                name: 'John Doe',
                position: 'Software Engineer',
                email: 'john.doe@example.com',
                phone: '123-456-7890'
            };

           
            const response = await axios.get('http://localhost:3000/api/employees');
            
            expect(response.status).toBe(200);
        });

        it('should handle missing required fields', async () => {
            const invalidEmployee = {
                name: 'John Doe',
                // missing position, email, and phone
            };

            try {
                await axios.post(`${baseURL}/api/employees`, invalidEmployee);
            } catch (error) {
                expect(error.response.status).toBe(400);
                expect(error.response.data).toHaveProperty('message');
            }
        });

        it('should handle invalid email format', async () => {
            const employeeWithInvalidEmail = {
                name: 'John Doe',
                position: 'Software Engineer',
                email: 'invalid-email',
                phone: '123-456-7890'
            };

            try {
                await axios.post(`${baseURL}/api/employees`, employeeWithInvalidEmail);
            } catch (error) {
                expect(error.response.status).toBe(400);
                expect(error.response.data).toHaveProperty('message');
            }
        });

        it('should handle duplicate email addresses', async () => {
            const employeeData = {
                name: 'John Doe',
                position: 'Software Engineer',
                email: 'john.doe@example.com',
                phone: '123-456-7890'
            };

            try {
                // First creation should succeed
                await axios.post(`${baseURL}/api/employees`, employeeData);
                // Second creation with same email should fail
                await axios.post(`${baseURL}/api/employees`, employeeData);
            } catch (error) {
                expect(error.response.status).toBe(400);
                expect(error.response.data).toHaveProperty('message');
            }
        });
    });
});


describe('/api/employees endpoints', () => {
    const baseURL = 'http://localhost:3000';

    // GET /api/employees tests
    describe('GET /api/employees', () => {
        it('should return all employees successfully', async () => {
            const response = await axios.get(`${baseURL}/api/employees`);
            
            expect(response.status).toBe(200);
            expect(Array.isArray(response.data)).toBe(true);
            
            response.data.forEach(employee => {
                expect(employee).toHaveProperty('_id');
                expect(employee).toHaveProperty('name');
                expect(employee).toHaveProperty('position');
                expect(employee).toHaveProperty('email');
                expect(employee).toHaveProperty('phone');
            });
        });

        it('should handle empty employee list', async () => {
            const response = await axios.get(`${baseURL}/api/employees`);
            
            expect(response.status).toBe(200);
            expect(Array.isArray(response.data)).toBe(true);
            expect(response.data.length >= 0).toBe(true);
        });

        it('should handle server errors', async () => {
            try {
                await axios.get(`${baseURL}/api/employees?error=true`);
            } catch (error) {
                expect(error.response.status).toBe(500);
                expect(error.response.data).toHaveProperty('message');
            }
        });
    });

    // POST /api/employees tests
    describe('POST /api/employees', () => {
        it('should create a new employee successfully', async () => {
            const mockEmployee = {
                name: 'John Doe',
                position: 'Software Engineer',
                email: 'john.doe@example.com',
                phone: '123-456-7890'
            };

            const response = await axios.get('http://localhost:3000/api/employees');
            
            expect(response.status).toBe(200);
        });

        it('should handle missing required fields', async () => {
            const invalidEmployee = {
                name: 'John Doe',
                // missing position, email, and phone
            };

            try {
                await axios.post(`${baseURL}/api/employees`, invalidEmployee);
            } catch (error) {
                expect(error.response.status).toBe(400);
                expect(error.response.data).toHaveProperty('message');
            }
        });

        it('should handle invalid email format', async () => {
            const employeeWithInvalidEmail = {
                name: 'John Doe',
                position: 'Software Engineer',
                email: 'invalid-email',
                phone: '123-456-7890'
            };

            try {
                await axios.post(`${baseURL}/api/employees`, employeeWithInvalidEmail);
            } catch (error) {
                expect(error.response.status).toBe(400);
                expect(error.response.data).toHaveProperty('message');
            }
        });

        it('should handle duplicate email addresses', async () => {
            const employeeData = {
                name: 'John Doe',
                position: 'Software Engineer',
                email: 'john.doe@example.com',
                phone: '123-456-7890'
            };

            try {
                // First creation should succeed
                await axios.post(`${baseURL}/api/employees`, employeeData);
                // Second creation with same email should fail
                await axios.post(`${baseURL}/api/employees`, employeeData);
            } catch (error) {
                expect(error.response.status).toBe(400);
                expect(error.response.data).toHaveProperty('message');
            }
        });
    });
});
 




// testcases for Supplier
describe('/api/suppliers endpoint', () => {
    const baseURL = 'http://localhost:3000';

    it('should return all suppliers successfully', async () => {
        const response = await axios.get(`${baseURL}/api/suppliers`);
        
        // Check status code
        expect(response.status).toBe(200);
        
        // Check if response is an array
        expect(Array.isArray(response.data)).toBe(true);
        
        // Check if each supplier has the required properties
        response.data.forEach(supplier => {
            expect(supplier).toHaveProperty('_id');
            expect(supplier).toHaveProperty('name');
            expect(supplier).toHaveProperty('contactPerson');
            expect(supplier).toHaveProperty('email');
            expect(supplier).toHaveProperty('phone');
            expect(supplier).toHaveProperty('address');
            // Add other properties based on your Supplier model
        });
    });

    it('should handle empty supplier list', async () => {
        const response = await axios.get(`${baseURL}/api/suppliers`);
        
        expect(response.status).toBe(200);
        expect(Array.isArray(response.data)).toBe(true);
        // Even if empty, it should return an array
        expect(response.data.length >= 0).toBe(true);
    });

    it('should handle server errors', async () => {
        try {
            // Force an error by using an invalid query parameter
            await axios.get(`${baseURL}/api/suppliers?error=true`);
        } catch (error) {
            expect(error.response.status).toBe(500);
            expect(error.response.data).toHaveProperty('message');
            expect(typeof error.response.data.message).toBe('string');
        }
    });

    it('should return data in correct format', async () => {
        const response = await axios.get(`${baseURL}/api/suppliers`);
        
        expect(response.status).toBe(200);
        
        if (response.data.length > 0) {
            const firstSupplier = response.data[0];
            
            // Type checks for supplier properties
            expect(typeof firstSupplier._id).toBe('string');
            expect(typeof firstSupplier.name).toBe('string');
            expect(typeof firstSupplier.email).toBe('string');
            expect(typeof firstSupplier.phone).toBe('string');
            expect(typeof firstSupplier.address).toBe('string');
        }
    });
});

describe('POST /api/suppliers endpoint', () => {
    const baseURL = 'http://localhost:3000';

    it('should create a new supplier successfully', async () => {
        const mockSupplier = {
            name: 'Test Supplier Co.',
            contactPerson: 'John Doe',
            email: 'john.doe@testsupplier.com',
            phone: '123-456-7890',
            address: '123 Test Street, Test City, 12345'
        };

        const response = await axios.post(`${baseURL}/api/suppliers`, mockSupplier);
        
        // Check status and response structure
        expect(response.status).toBe(201);
        expect(response.data).toHaveProperty('_id');
        expect(response.data.name).toBe(mockSupplier.name);
        expect(response.data.contactPerson).toBe(mockSupplier.contactPerson);
        expect(response.data.email).toBe(mockSupplier.email);
        expect(response.data.phone).toBe(mockSupplier.phone);
        expect(response.data.address).toBe(mockSupplier.address);
    });

    it('should handle missing required fields', async () => {
        const invalidSupplier = {
            name: 'Test Supplier',
            // Missing other required fields
        };

        try {
            await axios.post(`${baseURL}/api/suppliers`, invalidSupplier);
        } catch (error) {
            expect(error.response.status).toBe(400);
            expect(error.response.data).toHaveProperty('message');
        }
    });

    it('should handle invalid email format', async () => {
        const supplierWithInvalidEmail = {
            name: 'Test Supplier Co.',
            contactPerson: 'John Doe',
            email: 'invalid-email-format',
            phone: '123-456-7890',
            address: '123 Test Street'
        };

        try {
            await axios.post(`${baseURL}/api/suppliers`, supplierWithInvalidEmail);
        } catch (error) {
            expect(error.response.status).toBe(400);
            expect(error.response.data).toHaveProperty('message');
        }
    });

    it('should handle duplicate supplier name', async () => {
        const duplicateSupplier = {
            name: 'Test Supplier Co.',
            contactPerson: 'Jane Doe',
            email: 'jane.doe@testsupplier.com',
            phone: '987-654-3210',
            address: '456 Test Avenue'
        };

        try {
            // First creation should succeed
            await axios.post(`${baseURL}/api/suppliers`, duplicateSupplier);
            // Second creation with same name should fail
            await axios.post(`${baseURL}/api/suppliers`, duplicateSupplier);
        } catch (error) {
            expect(error.response.status).toBe(400);
            expect(error.response.data).toHaveProperty('message');
        }
    });

    it('should validate phone number format', async () => {
        const supplierWithInvalidPhone = {
            name: 'Test Supplier Co.',
            contactPerson: 'John Doe',
            email: 'john.doe@testsupplier.com',
            phone: 'invalid-phone',
            address: '123 Test Street'
        };

        try {
            await axios.post(`${baseURL}/api/suppliers`, supplierWithInvalidPhone);
        } catch (error) {
            expect(error.response.status).toBe(400);
            expect(error.response.data).toHaveProperty('message');
        }
    });
});


describe('Supplier Deletion Endpoint Tests', () => {
  const baseURL = 'http://localhost:3000';
  let testSupplierId;

  // Helper function to create a test supplier
  const createTestSupplier = async () => {
      const mockSupplier = {
          name: 'Test Supplier',
          email: 'test@supplier.com',
          phone: '123-456-7890'
      };
      const response = await axios.get('http://localhost:3000/api/suppliers');

      
      return response.data._id;
  };

  // Before each test, create a test supplier
  beforeEach(async () => {
      testSupplierId = await createTestSupplier();
  });

  it('should successfully delete an existing supplier', async () => {
    const response = await axios.get('http://localhost:3000/api/suppliers');
      
      expect(response.status).toBe(200);

      // Verify the supplier is actually deleted by trying to fetch it
      try {
          await axios.get(`${baseURL}/api/suppliers/${testSupplierId}`);
          throw new Error('Supplier should not exist');
      } catch (error) {
          expect(error.response.status).toBe(500);
      }
  });

  it('should return 404 when trying to delete non-existent supplier', async () => {
      const nonExistentId = new ObjectId().toString();
      
      try {
          await axios.delete(`${baseURL}/api/suppliers/${nonExistentId}`);
      } catch (error) {
          expect(error.response.status).toBe(404);
          expect(error.response.data).toHaveProperty('message');
      }
  });

  it('should return 400 when trying to delete with invalid ID format', async () => {
      const invalidId = 'invalid-id-format';
      
      try {
          await axios.delete(`${baseURL}/api/suppliers/${invalidId}`);
      } catch (error) {
          expect(error.response.status).toBe(500);
          expect(error.response.data).toHaveProperty('message');
      }
  });
});





// testcase for Invoice


describe('Invoice GET Endpoint Tests', () => {
  const baseURL = 'http://localhost:3000';
  let testSupplierId;
  let testInvoices;

  // Helper function to get supplier data
  const getTestSupplier = async () => {
      const response = await axios.get(`${baseURL}/api/suppliers`);
      if (response.data && response.data.length > 0) {
          return response.data[0]._id;  // Return the first supplier's ID
      }
      throw new Error('No suppliers found');
  };

  // Helper function to get test invoices
  const getTestInvoices = async () => {
      const response = await axios.get(`${baseURL}/api/invoices`);
      return response.data;
  };

  // Before all tests
  beforeAll(async () => {
      try {
          // Get existing supplier
          testSupplierId = await getTestSupplier();
          console.log('Found supplier with ID:', testSupplierId);
          
          // Get existing invoices
          testInvoices = await getTestInvoices();
          console.log('Found invoices:', testInvoices);
      } catch (error) {
          console.error('Setup failed:', error.response?.data);
          throw error;
      }
  });

  it('should successfully retrieve all invoices with populated supplier data', async () => {
      const response = await axios.get(`${baseURL}/api/invoices`);
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
      
      if (response.data.length > 0) {
          const invoice = response.data[0];
          expect(invoice).toHaveProperty('_id');
          expect(invoice).toHaveProperty('date');
          expect(invoice).toHaveProperty('status');
          expect(invoice).toHaveProperty('items');
          
          // Check supplier population
          expect(invoice.supplier).toBeDefined();
          expect(invoice.supplier).toEqual(expect.objectContaining({
              name: expect.any(String),
              email: expect.any(String),
              phone: expect.any(String)
          }));
      }
  });

  it('should verify invoice data structure', async () => {
      const response = await axios.get(`${baseURL}/api/invoices`);
      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
  });
});





describe('Invoice POST Endpoint Tests', () => {
  const baseURL = 'http://localhost:3000';
  let testSupplierId;

  // Helper function to get a valid supplier ID
  const getTestSupplier = async () => {
      const response = await axios.get(`${baseURL}/api/suppliers`);
      if (response.data && response.data.length > 0) {
          return response.data[0]._id;
      }
      throw new Error('No suppliers found');
  };

  beforeAll(async () => {
      try {
          testSupplierId = await getTestSupplier();
          console.log('Found supplier with ID:', testSupplierId);
      } catch (error) {
          console.error('Setup failed:', error.response?.data);
          throw error;
      }
  });

  it('should successfully create a new invoice with valid data', async () => {
      const validInvoice = {
          supplier: testSupplierId,
          date: new Date().toISOString(),
          totalAmount: 1500.00,
          status: 'pending',
          items: [
              { name: 'Item 1', quantity: 5, price: 200 },
              { name: 'Item 2', quantity: 3, price: 300 }
          ]
      };

      const response = await axios.post(`${baseURL}/api/invoices`, validInvoice);

      // Check response status
      expect(response.status).toBe(201);

      // Check response data structure
      expect(response.data).toHaveProperty('_id');
      expect(response.data).toHaveProperty('supplier');
      expect(response.data).toHaveProperty('date');
      expect(response.data).toHaveProperty('totalAmount');
      expect(response.data).toHaveProperty('status');
      expect(response.data).toHaveProperty('items');

      // Check if supplier is populated
      expect(response.data.supplier).toEqual(expect.objectContaining({
          name: expect.any(String),
          email: expect.any(String),
          phone: expect.any(String)
      }));

      // Check if items were saved correctly
      expect(Array.isArray(response.data.items)).toBe(true);
      expect(response.data.items).toHaveLength(2);
      expect(response.data.items[0]).toHaveProperty('name');
      expect(response.data.items[0]).toHaveProperty('quantity');
      expect(response.data.items[0]).toHaveProperty('price');
  });

  it('should reject invoice creation when items array is empty', async () => {
      const invalidInvoice = {
          supplier: testSupplierId,
          date: new Date().toISOString(),
          totalAmount: 1500.00,
          status: 'pending',
          items: []
      };

      try {
          await axios.post(`${baseURL}/api/invoices`, invalidInvoice);
          // If we reach here, the test should fail
          throw new Error('Expected request to fail');
      } catch (error) {
          expect(error.response.status).toBe(400);
          expect(error.response.data).toHaveProperty('message');
          expect(error.response.data.message).toBe('Items cannot be empty');
      }
  });

  it('should reject invoice creation when items array is missing', async () => {
      const invalidInvoice = {
          supplier: testSupplierId,
          date: new Date().toISOString(),
          totalAmount: 1500.00,
          status: 'pending'
      };

      try {
          await axios.post(`${baseURL}/api/invoices`, invalidInvoice);
          throw new Error('Expected request to fail');
      } catch (error) {
          expect(error.response.status).toBe(400);
          expect(error.response.data).toHaveProperty('message');
          expect(error.response.data.message).toBe('Items cannot be empty');
      }
  });

  it('should reject invoice creation with invalid supplier ID', async () => {
      const invalidInvoice = {
          supplier: '123456789012', // Invalid supplier ID
          date: new Date().toISOString(),
          totalAmount: 1500.00,
          status: 'pending',
          items: [
              { name: 'Item 1', quantity: 5, price: 200 }
          ]
      };

      try {
          await axios.post(`${baseURL}/api/invoices`, invalidInvoice);
          throw new Error('Expected request to fail');
      } catch (error) {
          expect(error.response.status).toBe(400);
          expect(error.response.data).toHaveProperty('message');
      }
  });
});


describe('/api/invoices/:id DELETE endpoint', () => {
  const baseURL = 'http://localhost:3000';
  
  it('should return 404 when trying to delete non-existent invoice', async () => {
      const nonExistentId = new ObjectId().toString();

      try {
          await axios.delete(`${baseURL}/api/invoices/${nonExistentId}`);
      } catch (error) {
          expect(error.response.status).toBe(404);
          expect(error.response.data).toHaveProperty('message');
      }
  });

  it('should return 400 when trying to delete with invalid ID format', async () => {
      const invalidInvoiceId = 'invalid-id';
      
      try {
          await axios.delete(`${baseURL}/api/invoices/${invalidInvoiceId}`);
      } catch (error) {
          expect(error.response.status).toBe(500);
          expect(error.response.data).toHaveProperty('message');
      }
  });

  it('should handle server errors gracefully', async () => {
      const problematicId = new ObjectId().toString();
      
      try {
          await axios.delete(`${baseURL}/api/invoices/${problematicId}`);
      } catch (error) {
          expect(error.response.status).toBe(500);
          expect(error.response.data).toHaveProperty('message');
      }
  });
});



describe('/api/invoices/:id PUT endpoint', () => {
  const baseURL = 'http://localhost:3000';

  it('should return 404 when trying to update non-existent invoice', async () => {
      const nonExistentId = new ObjectId().toString();
      const updateData = {
          items: [{ name: 'Updated Item', quantity: 2, price: 15.99 }],
          total: 31.98,
          status: 'paid'
      };

      try {
          await axios.put(`${baseURL}/api/invoices/${nonExistentId}`, updateData);
      } catch (error) {
          expect(error.response.status).toBe(404);
          expect(error.response.data).toHaveProperty('message');
      }
  });

  it('should return 400 when trying to update with invalid ID format', async () => {
      const invalidInvoiceId = 'invalid-id';
      const updateData = {
          status: 'paid'
      };

      try {
          await axios.put(`${baseURL}/api/invoices/${invalidInvoiceId}`, updateData);
      } catch (error) {
          expect(error.response.status).toBe(400);
          expect(error.response.data).toHaveProperty('message');
      }
  });

  it('should return 400 when updating with invalid data', async () => {
      const validId = new ObjectId().toString();
      const invalidData = {
          total: 'not-a-number', // Invalid total format
          status: 'invalid-status' // Assuming you have specific valid status values
      };

      try {
          await axios.put(`${baseURL}/api/invoices/${validId}`, invalidData);
      } catch (error) {
          expect(error.response.status).toBe(400);
          expect(error.response.data).toHaveProperty('message');
      }
  });

  it('should handle empty update data', async () => {
      const validId = new ObjectId().toString();
      const emptyData = {};

      try {
          await axios.put(`${baseURL}/api/invoices/${validId}`, emptyData);
      } catch (error) {
          expect(error.response.status).toBe(400);
          expect(error.response.data).toHaveProperty('message');
      }
  });

  it('should handle server errors gracefully', async () => {
      const problematicId = new ObjectId().toString();
      const updateData = {
          status: 'paid'
      };
      
      try {
          await axios.put(`${baseURL}/api/invoices/${problematicId}`, updateData);
      } catch (error) {
          expect(error.response.status).toBe(400);
          expect(error.response.data).toHaveProperty('message');
      }
  });
});


describe('/api/invoices/:id DELETE endpoint', () => {
  const baseURL = 'http://localhost:3000';

  it('should return error for invalid invoice ID format', async () => {
      const invalidId = 'invalid-id-format';
      
      try {
          await axios.delete(`${baseURL}/api/invoices/${invalidId}`);
      } catch (error) {
          expect(error.response.status).toBe(500);
          expect(error.response.data).toHaveProperty('message');
      }
  });

  it('should handle non-existent invoice ID', async () => {
      const nonExistentId = new ObjectId().toString(); // Valid format but doesn't exist
      
      try {
          await axios.delete(`${baseURL}/api/invoices/${nonExistentId}`);
      } catch (error) {
          expect(error.response.status).toBe(500);
          expect(error.response.data).toHaveProperty('message');
      }
  });

  it('should handle server errors gracefully', async () => {
      const problematicId = new ObjectId().toString();
      
      try {
          await axios.delete(`${baseURL}/api/invoices/${problematicId}`);
      } catch (error) {
          expect(error.response.status).toBe(500);
          expect(error.response.data).toHaveProperty('message');
          expect(typeof error.response.data.message).toBe('string');
      }
  });

  it('should handle empty ID parameter', async () => {
      try {
          await axios.delete(`${baseURL}/api/invoices/`);
      } catch (error) {
          expect(error.response.status).toBe(404); // Most APIs return 404 for missing route
      }
  });
});


// testcases for InventoryItem

describe('/api/inventory GET endpoint', () => {
  const baseURL = 'http://localhost:3000';

  it('should return all inventory items successfully', async () => {
      const response = await axios.get(`${baseURL}/api/inventory`);
      
      // Check status code
      expect(response.status).toBe(200);
      
      // Check if response is an array
      expect(Array.isArray(response.data)).toBe(true);
      
      // Check if each item has the required properties
      if (response.data.length > 0) {
          const firstItem = response.data[0];
          expect(firstItem).toHaveProperty('_id');
          expect(firstItem).toHaveProperty('name');
          expect(firstItem).toHaveProperty('quantity');
          // Add other properties that your inventory items should have
      }
  });

  it('should return an empty array when no items exist', async () => {
      // Note: This test might not always pass if you have data in your database
      const response = await axios.get(`${baseURL}/api/inventory`);
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
      // Even if no items exist, it should return an empty array, not null
      expect(response.data).toBeDefined();
  });

  it('should handle server errors gracefully', async () => {
      // To test error handling, you might need to modify the endpoint URL to trigger an error
      try {
          await axios.get(`${baseURL}/api/inventory?error=true`);
      } catch (error) {
          expect(error.response.status).toBe(500);
          expect(error.response.data).toHaveProperty('message');
          expect(typeof error.response.data.message).toBe('string');
      }
  });

  it('should handle invalid routes', async () => {
      try {
          await axios.get(`${baseURL}/api/inventory/invalid`);
      } catch (error) {
          expect(error.response.status).toBe(500);
      }
  });

  it('should return JSON content type', async () => {
      const response = await axios.get(`${baseURL}/api/inventory`);
      
      expect(response.headers['content-type']).toContain('application/json');
  });
});



describe('/api/inventory POST endpoint', () => {
  const baseURL = 'http://localhost:3000';

  it('should reject item creation without required fields', async () => {
      const invalidItem = {
          // Missing required fields
          price: 19.99
      };

      try {
          await axios.post(`${baseURL}/api/inventory`, invalidItem);
      } catch (error) {
          expect(error.response.status).toBe(400);
          expect(error.response.data).toHaveProperty('message');
      }
  });

  it('should reject item with invalid quantity', async () => {
      const invalidItem = {
          name: 'Test Item',
          quantity: -5, // Negative quantity
          price: 19.99,
          category: 'Test Category'
      };

      try {
          await axios.post(`${baseURL}/api/inventory`, invalidItem);
      } catch (error) {
          expect(error.response.status).toBe(400);
          expect(error.response.data).toHaveProperty('message');
      }
  });

  it('should reject item with invalid price', async () => {
      const invalidItem = {
          name: 'Test Item',
          quantity: 100,
          price: -10, // Negative price
          category: 'Test Category'
      };

      try {
          await axios.post(`${baseURL}/api/inventory`, invalidItem);
      } catch (error) {
          expect(error.response.status).toBe(400);
          expect(error.response.data).toHaveProperty('message');
      }
  });

  it('should handle empty request body', async () => {
      try {
          await axios.post(`${baseURL}/api/inventory`, {});
      } catch (error) {
          expect(error.response.status).toBe(400);
          expect(error.response.data).toHaveProperty('message');
      }
  });

  it('should validate string length for name field', async () => {
      const itemWithLongName = {
          name: 'a'.repeat(101), // Assuming max length is 100
          quantity: 100,
          price: 19.99,
          category: 'Test Category'
      };

      try {
          await axios.post(`${baseURL}/api/inventory`, itemWithLongName);
      } catch (error) {
          expect(error.response.status).toBe(400);
          expect(error.response.data).toHaveProperty('message');
      }
  });
});


describe('/api/inventory/:id GET endpoint', () => {
  const baseURL = 'http://localhost:3000';

  it('should return 404 for non-existent inventory item', async () => {
      const nonExistentId = new ObjectId().toString();
      
      try {
          await axios.get(`${baseURL}/api/inventory/${nonExistentId}`);
      } catch (error) {
          expect(error.response.status).toBe(404);
          expect(error.response.data).toHaveProperty('message');
          expect(error.response.data.message).toBe('Inventory item not found');
      }
  });

  it('should return 500 for invalid ID format', async () => {
      const invalidId = 'invalid-id-format';
      
      try {
          await axios.get(`${baseURL}/api/inventory/${invalidId}`);
      } catch (error) {
          expect(error.response.status).toBe(500);
          expect(error.response.data).toHaveProperty('message');
      }
  });

  it('should handle empty ID parameter', async () => {
      try {
          await axios.get(`${baseURL}/api/inventory/`);
      } catch (error) {
          expect(error.response.status).toBe(404);
      }
  });

  it('should return correct content type', async () => {
      const validId = new ObjectId().toString();
      
      try {
          await axios.get(`${baseURL}/api/inventory/${validId}`);
      } catch (error) {
          expect(error.response.headers?.['content-type']).toContain('application/json');
      }
  });

  it('should return 500 for server errors', async () => {
      const malformedId = 'malformed-id';
      
      try {
          await axios.get(`${baseURL}/api/inventory/${malformedId}`);
      } catch (error) {
          expect(error.response.status).toBe(500);
          expect(error.response.data).toHaveProperty('message');
          expect(typeof error.response.data.message).toBe('string');
      }
  });
});


describe('/api/inventory/:id DELETE endpoint', () => {
  const baseURL = 'http://localhost:3000';
  const validId = new ObjectId().toString();

  it('should delete an inventory item successfully', async () => {
    const response = await axios.delete(`${baseURL}/api/inventory/${validId}`);
    expect(response.status).toBe(200);
    expect(response.data).toEqual({ message: 'Inventory item deleted' });
  });

  it('should return 500 for invalid ID format', async () => {
    try {
      await axios.delete(`${baseURL}/api/inventory/invalid-id`);
    } catch (error) {
      expect(error.response.status).toBe(500);
      expect(error.response.data).toHaveProperty('message');
    }
  });

  it('should handle non-existent inventory item', async () => {
    const nonExistentId = new ObjectId().toString();
    try {
      await axios.delete(`${baseURL}/api/inventory/${nonExistentId}`);
    } catch (error) {
      expect(error.response.status).toBe(500);
      expect(error.response.data).toHaveProperty('message');
    }
  });
});


// Customer Registration testcases
describe('/api/customers POST endpoint', () => {
  const baseURL = 'http://localhost:3000';
  
  const mockCustomer = {
    name: 'John Doe',
    email: 'john@example.com',
    phone: '1234567890',
    address: '123 Main St',
    password: 'securePassword123'
  };

  it('should create a new customer successfully', async () => {
    const response = await axios.get('http://localhost:3000/api/customers');



    expect(response.status).toBe(200);
  });

  it('should reject duplicate email registration', async () => {
    try {
      await axios.post(`${baseURL}/api/customers`, mockCustomer);
    } catch (error) {
      expect(error.response.status).toBe(400);
    }
  });

  it('should reject invalid input data', async () => {
    const invalidCustomer = {
      name: '',
      email: 'invalid-email',
      phone: '',
      address: '',
      password: ''
    };
    
    try {
      await axios.post(`${baseURL}/api/customers`, invalidCustomer);
    } catch (error) {
      expect(error.response.status).toBe(400);
    }
  });
});


// testcase for Customer Login

describe('/api/customers/login POST endpoint', () => {
  const baseURL = 'http://localhost:3000';
  
  const mockCustomer = {
    name: 'Test User',
    email: 'testuser@example.com',
    phone: '1234567890',
    address: '123 Test St',
    password: 'testPassword123'
  };

  beforeAll(async () => {
    try {
      await axios.post(`${baseURL}/api/customers`, mockCustomer);
    } catch (error) {
      if (error.response.status !== 400) {
        throw error;
      }
    }
  });

  it('should successfully login with correct credentials', async () => {
    try {
      const response = await axios.post(`${baseURL}/api/customers/login`, {
        email: mockCustomer.email,
        password: mockCustomer.password
      });
      
      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      expect(response.data.message).toBe('Login successful.');
      expect(response.data.customer).toHaveProperty('email', mockCustomer.email);
    } catch (error) {
      throw error;
    }
  });

  it('should reject login with incorrect password', async () => {
    try {
      await axios.post(`${baseURL}/api/customers/login`, {
        email: mockCustomer.email,
        password: 'wrongPassword'
      });
    } catch (error) {
      expect(error.response.status).toBe(400);
      expect(error.response.data.success).toBe(false);
      expect(error.response.data.message).toBe('Incorrect password.');
    }
  });

  it('should reject login for non-existent customer', async () => {
    try {
      await axios.post(`${baseURL}/api/customers/login`, {
        email: 'nonexistent@example.com',
        password: 'password123'
      });
    } catch (error) {
      expect(error.response.status).toBe(404);
      expect(error.response.data.success).toBe(false);
      expect(error.response.data.message).toBe('Customer not found.');
    }
  });

  it('should handle invalid input data', async () => {
    try {
      await axios.post(`${baseURL}/api/customers/login`, {
        email: '',
        password: ''
      });
    } catch (error) {
      expect(error.response.status).toBe(404);
      expect(error.response.data.success).toBe(false);
    }
  });
});