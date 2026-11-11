export default function trackingHandler({ io, socket }) {
    
    // 1. 👷‍♂️ Technician का रूम (Job Notification के लिए)
    socket.on("join-booking", (technicianId) => {
        socket.join("technicians"); // Broadcast room for all technicians
        if (technicianId) {
            socket.join(technicianId.toString());
        }
        console.log(`👷‍♂️ Technician joined private room: ${technicianId} & global room: technicians`);
    });
    
    // 2. 📍 Customer / Technician का रूम (Live Tracking देखने के लिए)
    socket.on("join-tracking-room", (OrderId) => {
        if (!OrderId) return;
        socket.join(OrderId.toString());
        console.log(`📍 Joined tracking room for Order: ${OrderId}`);
    });

    socket.on("leave-tracking-room", (OrderId) => {
        if (!OrderId) return;
        socket.leave(OrderId.toString());
        console.log(`📍 Left tracking room for Order: ${OrderId}`);
    });

    // 3. 👤 Customer का पर्सनल रूम (Plumber Assign होने का अपडेट सुनने के लिए)
    socket.on("join-my-room", (userId) => {
        if (!userId) return;
        socket.join(userId.toString());
        console.log(`👤 Customer joined personal room: ${userId}`);
    });

    // 4. 🚀 Technician लोकेशन भेज रहा है (Frontend के 'send-location' से मैच किया)
    socket.on("send-location", (data) => {
        const { OrderId, latitude, longitude } = data || {};
        if (!OrderId || latitude === undefined || longitude === undefined) return;
        
        console.log(`✅ Location received for Order ${OrderId}: [${latitude}, ${longitude}]`);
        
        io.to(OrderId.toString()).emit("receive-location", { 
            latitude: Number(latitude), 
            longitude: Number(longitude), 
            isOnline: data.isOnline !== undefined ? data.isOnline : true, 
            status: data.status || "On-the-way" 
        });
    });

    // 4b. Status Updates (e.g. On-the-way, Working, Completed)
    socket.on("update-status", (data) => {
        const { OrderId, status } = data || {};
        if (OrderId && status) {
            console.log(`⚡ Status update for Order ${OrderId}: ${status}`);
            io.to(OrderId.toString()).emit("receive-status", { status });
        }
    });

    // 5. Disconnect
    socket.on("disconnect", () => {
        console.log('🔴 User disconnected:', socket.id);
    });
}
