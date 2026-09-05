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
                    new Employee("Aarav", "Sharma", "aarav.sharma@example.com", "IT", "Senior Software Engineer", 75000, "Rajesh Menon"),
                    new Employee("Ananya", "Iyer", "ananya.iyer@example.com", "HR", "HR Manager", 65000, "Rajesh Menon"),
                    new Employee("Rohan", "Mehta", "rohan.mehta@example.com", "Finance", "Senior Accountant", 58000, "Ananya Iyer"),
                    new Employee("Priya", "Nair", "priya.nair@example.com", "IT", "Software Developer", 68000, "Aarav Sharma"),
                    new Employee("Vikram", "Singh", "vikram.singh@example.com", "Sales", "Sales Executive", 55000, "Rajesh Menon"),
                    new Employee("Kavya", "Reddy", "kavya.reddy@example.com", "HR", "Talent Acquisition", 52000, "Ananya Iyer"),
                    new Employee("Arjun", "Patel", "arjun.patel@example.com", "Operations", "Operations Lead", 64000, "Rajesh Menon"),
                    new Employee("Sneha", "Desai", "sneha.desai@example.com", "Finance", "Financial Analyst", 62000, "Rohan Mehta")
                );
                employeeRepository.saveAll(employees);

                // 2. Seed Attendance for today
                LocalDate today = LocalDate.now();
                attendanceRepository.saveAll(List.of(
                    new Attendance(1L, "Aarav Sharma", today, "Present"),
                    new Attendance(2L, "Ananya Iyer", today, "Present"),
                    new Attendance(3L, "Rohan Mehta", today, "Absent"),
                    new Attendance(4L, "Priya Nair", today, "Present"),
                    new Attendance(5L, "Vikram Singh", today, "Present"),
                    new Attendance(6L, "Kavya Reddy", today, "Present"),
                    new Attendance(7L, "Arjun Patel", today, "Present"),
                    new Attendance(8L, "Sneha Desai", today, "Half-Day")
                ));

                // 3. Seed Sample Leave Requests
                leaveRequestRepository.saveAll(List.of(
                    new LeaveRequest(3L, "Rohan Mehta", "Sick Leave", today, today.plusDays(2), "Viral fever and doctor recommended bed rest", "Pending"),
                    new LeaveRequest(1L, "Aarav Sharma", "Casual Leave", today.plusDays(5), today.plusDays(7), "Attending family reunion", "Approved"),
                    new LeaveRequest(6L, "Kavya Reddy", "Casual Leave", today.plusDays(10), today.plusDays(11), "Personal errand", "Pending")
                ));
            }
        };
    }
}
