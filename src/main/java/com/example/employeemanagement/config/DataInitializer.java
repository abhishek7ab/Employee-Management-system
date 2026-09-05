package com.example.employeemanagement.config;

import com.example.employeemanagement.model.Attendance;
import com.example.employeemanagement.model.Employee;
import com.example.employeemanagement.model.LeaveRequest;
import com.example.employeemanagement.repository.AttendanceRepository;
import com.example.employeemanagement.repository.EmployeeRepository;
import com.example.employeemanagement.repository.LeaveRequestRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.LocalDate;
import java.util.List;

@Configuration
public class DataInitializer {

    @Bean
    public CommandLineRunner initDatabase(
            EmployeeRepository employeeRepository,
            AttendanceRepository attendanceRepository,
            LeaveRequestRepository leaveRequestRepository) {
        return args -> {
            if (employeeRepository.count() == 0) {
                // 1. Seed Employees matching user SQL dataset
                List<Employee> employees = List.of(
                    new Employee("John", "Doe", "john.doe@example.com", "IT", "Senior Software Engineer", 75000, "Robert Vance"),
                    new Employee("Jane", "Smith", "jane.smith@example.com", "HR", "HR Manager", 65000, "Robert Vance"),
                    new Employee("Michael", "Johnson", "michael.johnson@example.com", "Finance", "Senior Accountant", 58000, "Jane Smith"),
                    new Employee("Emily", "Williams", "emily.williams@example.com", "IT", "Software Developer", 68000, "John Doe"),
                    new Employee("Robert", "Brown", "robert.brown@example.com", "Sales", "Sales Executive", 55000, "Robert Vance"),
                    new Employee("Sarah", "Davis", "sarah.davis@example.com", "HR", "Talent Acquisition", 52000, "Jane Smith"),
                    new Employee("James", "Miller", "james.miller@example.com", "Operations", "Operations Lead", 64000, "Robert Vance"),
                    new Employee("Lisa", "Wilson", "lisa.wilson@example.com", "Finance", "Financial Analyst", 62000, "Michael Johnson")
                );
                employeeRepository.saveAll(employees);

                // 2. Seed Attendance for today
                LocalDate today = LocalDate.now();
                attendanceRepository.saveAll(List.of(
                    new Attendance(1L, "John Doe", today, "Present"),
                    new Attendance(2L, "Jane Smith", today, "Present"),
                    new Attendance(3L, "Michael Johnson", today, "Absent"),
                    new Attendance(4L, "Emily Williams", today, "Present"),
                    new Attendance(5L, "Robert Brown", today, "Present"),
                    new Attendance(6L, "Sarah Davis", today, "Present"),
                    new Attendance(7L, "James Miller", today, "Present"),
                    new Attendance(8L, "Lisa Wilson", today, "Half-Day")
                ));

                // 3. Seed Sample Leave Requests
                leaveRequestRepository.saveAll(List.of(
                    new LeaveRequest(3L, "Michael Johnson", "Sick Leave", today, today.plusDays(2), "Viral fever and doctor recommended bed rest", "Pending"),
                    new LeaveRequest(1L, "John Doe", "Casual Leave", today.plusDays(5), today.plusDays(7), "Attending family reunion", "Approved"),
                    new LeaveRequest(6L, "Sarah Davis", "Casual Leave", today.plusDays(10), today.plusDays(11), "Personal errand", "Pending")
                ));
            }
        };
    }
}
