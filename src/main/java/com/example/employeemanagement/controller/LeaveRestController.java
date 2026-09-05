package com.example.employeemanagement.controller;

import com.example.employeemanagement.model.LeaveRequest;
import com.example.employeemanagement.repository.LeaveRequestRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/leaves")
@CrossOrigin(origins = "*")
public class LeaveRestController {

    private final LeaveRequestRepository leaveRequestRepository;

    public LeaveRestController(LeaveRequestRepository leaveRequestRepository) {
        this.leaveRequestRepository = leaveRequestRepository;
    }

    // 1. Get all leave requests (Supports ?status=Pending and ?employeeId=X)
    @GetMapping
    public List<LeaveRequest> getAllLeaves(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Long employeeId) {
        List<LeaveRequest> list = leaveRequestRepository.findAllByOrderByIdDesc();

        if (status != null && !status.isBlank()) {
            list = list.stream()
                    .filter(l -> l.getStatus() != null && l.getStatus().equalsIgnoreCase(status.trim()))
                    .collect(Collectors.toList());
        }

        if (employeeId != null) {
            list = list.stream()
                    .filter(l -> l.getEmployeeId() != null && l.getEmployeeId().equals(employeeId))
                    .collect(Collectors.toList());
        }

        return list;
    }

    // 2. Submit a new leave request
    @PostMapping
    public LeaveRequest applyLeave(@RequestBody LeaveRequest leaveRequest) {
        if (leaveRequest.getStatus() == null || leaveRequest.getStatus().isBlank()) {
            leaveRequest.setStatus("Pending");
        }
        return leaveRequestRepository.save(leaveRequest);
    }

    // 3. Approve or Reject leave
    @PutMapping("/{id}/status")
    public LeaveRequest updateStatus(@PathVariable Long id, @RequestBody Map<String, String> statusUpdate) {
        LeaveRequest leave = leaveRequestRepository.findById(id).orElse(null);
        if (leave != null) {
            leave.setStatus(statusUpdate.get("status"));
            return leaveRequestRepository.save(leave);
        }
        return null;
    }
}
