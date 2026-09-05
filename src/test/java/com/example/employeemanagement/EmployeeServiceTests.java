package com.example.employeemanagement;

import com.example.employeemanagement.model.Employee;
import com.example.employeemanagement.service.EmployeeService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class EmployeeServiceTests {

    @Autowired
    private EmployeeService employeeService;

    @Test
    void testCrudOperations() {
        // Create
        Employee emp = new Employee("Ishaan", "Kulkarni", "ishaan@example.com", "IT", "Developer", 50000, "Rajesh Menon");
        Employee saved = employeeService.saveEmployee(emp);
        assertNotNull(saved.getId());
        assertEquals("Rajesh Menon", saved.getManagerName());

        // Read
        Employee fetched = employeeService.getEmployeeById(saved.getId());
        assertEquals("Ishaan", fetched.getFirstName());

        // Update
        fetched.setSalary(55000);
        Employee updated = employeeService.updateEmployee(saved.getId(), fetched);
        assertEquals(55000, updated.getSalary());

        // List
        List<Employee> list = employeeService.getAllEmployees();
        assertFalse(list.isEmpty());

        // Search & Filter
        List<Employee> itEmployees = employeeService.searchAndFilterEmployees("IT", null, null);
        assertFalse(itEmployees.isEmpty());

        List<Employee> ishaanFilter = employeeService.searchAndFilterEmployees(null, null, "Ishaan");
        assertFalse(ishaanFilter.isEmpty());

        // Delete
        employeeService.deleteEmployee(saved.getId());
        assertNull(employeeService.getEmployeeById(saved.getId()));
    }
}
