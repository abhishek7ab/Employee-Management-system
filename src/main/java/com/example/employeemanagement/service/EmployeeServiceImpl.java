package com.example.employeemanagement.service;

import com.example.employeemanagement.model.Employee;
import com.example.employeemanagement.repository.EmployeeRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class EmployeeServiceImpl implements EmployeeService {

    private final EmployeeRepository employeeRepository;

    public EmployeeServiceImpl(EmployeeRepository employeeRepository) {
        this.employeeRepository = employeeRepository;
    }

    @Override
    public List<Employee> getAllEmployees() {
        return employeeRepository.findAll();
    }

    @Override
    public List<Employee> searchAndFilterEmployees(String department, String manager, String search) {
        return employeeRepository.findAll().stream()
                .filter(e -> department == null || department.isBlank() || 
                        (e.getDepartment() != null && e.getDepartment().equalsIgnoreCase(department.trim())))
                .filter(e -> manager == null || manager.isBlank() || 
                        (e.getManagerName() != null && e.getManagerName().equalsIgnoreCase(manager.trim())))
                .filter(e -> search == null || search.isBlank() ||
                        (e.getFirstName() != null && e.getFirstName().toLowerCase().contains(search.trim().toLowerCase())) ||
                        (e.getLastName() != null && e.getLastName().toLowerCase().contains(search.trim().toLowerCase())) ||
                        (e.getEmail() != null && e.getEmail().toLowerCase().contains(search.trim().toLowerCase())) ||
                        (e.getDesignation() != null && e.getDesignation().toLowerCase().contains(search.trim().toLowerCase())))
                .collect(Collectors.toList());
    }

    @Override
    public Employee getEmployeeById(Long id) {
        return employeeRepository.findById(id).orElse(null);
    }

    @Override
    public Employee saveEmployee(Employee employee) {
        return employeeRepository.save(employee);
    }

    @Override
    public Employee updateEmployee(Long id, Employee employee) {
        Employee existing = employeeRepository.findById(id).orElse(null);
        if (existing != null) {
            existing.setFirstName(employee.getFirstName());
            existing.setLastName(employee.getLastName());
            existing.setEmail(employee.getEmail());
            existing.setDepartment(employee.getDepartment());
            existing.setDesignation(employee.getDesignation());
            existing.setSalary(employee.getSalary());
            existing.setManagerName(employee.getManagerName());
            return employeeRepository.save(existing);
        }
        return null;
    }

    @Override
    public void deleteEmployee(Long id) {
        employeeRepository.deleteById(id);
    }
}
