package com.example.employeemanagement.controller;

import com.example.employeemanagement.model.Attendance;
import com.example.employeemanagement.repository.AttendanceRepository;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/attendance")
@CrossOrigin(origins = "*")
public class AttendanceRestController {

    private final AttendanceRepository attendanceRepository;

    public AttendanceRestController(AttendanceRepository attendanceRepository) {
        this.attendanceRepository = attendanceRepository;
    }

    // Get attendance (Supports ?date=YYYY-MM-DD and ?employeeId=X)
    @GetMapping
    public List<Attendance> getAttendance(
            @RequestParam(required = false) String date,
            @RequestParam(required = false) Long employeeId) {
        LocalDate queryDate = (date != null && !date.isBlank()) ? LocalDate.parse(date) : LocalDate.now();
        List<Attendance> list = attendanceRepository.findByDate(queryDate);

        if (employeeId != null) {
            return list.stream()
                    .filter(a -> a.getEmployeeId().equals(employeeId))
                    .collect(Collectors.toList());
        }
        return list;
    }

    // Mark or update attendance
    @PostMapping("/mark")
    public Attendance markAttendance(@RequestBody Attendance request) {
        LocalDate recordDate = request.getDate() != null ? request.getDate() : LocalDate.now();
        Optional<Attendance> existing = attendanceRepository.findByEmployeeIdAndDate(request.getEmployeeId(), recordDate);

        if (existing.isPresent()) {
            Attendance attendance = existing.get();
            attendance.setStatus(request.getStatus());
            return attendanceRepository.save(attendance);
        } else {
            request.setDate(recordDate);
            return attendanceRepository.save(request);
        }
    }
}
