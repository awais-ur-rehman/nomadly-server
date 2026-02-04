
import mongoose from 'mongoose';
import { User } from '../src/modules/users/models/user.model';
import { UserService } from '../src/modules/users/services/user.service';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/nomadly';

async function run() {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    const userService = new UserService();

    // Clean up test users
    await User.deleteMany({ email: { $in: ['john_traveler@test.com', 'viewer@test.com'] } });

    // 1. Create User A (John) - The Traveler
    const john = await User.create({
        email: 'john_traveler@test.com',
        username: 'john_traveler',
        password_hash: 'hash',
        is_active: true,
        is_private: false,
    });
    console.log('Created John:', john._id);

    // 2. Set Trip for John (Origin: NYC, Dest: LA)
    // NYC: [-74.006, 40.7128], LA: [-118.2437, 34.0522]
    await userService.updateTravelRoute(
        john._id.toString(),
        { type: 'Point', coordinates: [-74.006, 40.7128] }, // Origin: NYC
        { type: 'Point', coordinates: [-118.2437, 34.0522] }, // Dest: LA
        new Date('2024-06-01'),
        7
    );
    console.log('Updated John\'s trip: NYC -> LA');

    // 3. Create User B (Viewer)
    const viewer = await User.create({
        email: 'viewer@test.com',
        username: 'viewer',
        password_hash: 'hash',
        is_active: true,
    });
    console.log('Created Viewer:', viewer._id);

    // 4. Search Travelers as Viewer located in LA (Near Destination)
    console.log('\n--- Searching from LA (Destination) ---');
    const resultsLA = await userService.searchTravelers(34.0522, -118.2437, 50000, { page: 1, limit: 10 }, viewer._id.toString());
    console.log(`Found ${resultsLA.total} travelers near LA.`);
    resultsLA.users.forEach((u: any) => console.log(` - ${u.username} (Dest: ${u.travel_route.destination.coordinates})`));

    // 5. Search Travelers as Viewer located in NYC (Near Origin)
    console.log('\n--- Searching from NYC (Origin) ---');
    const resultsNYC = await userService.searchTravelers(40.7128, -74.006, 50000, { page: 1, limit: 10 }, viewer._id.toString());
    console.log(`Found ${resultsNYC.total} travelers near NYC.`);
    resultsNYC.users.forEach((u: any) => console.log(` - ${u.username}`));

    await mongoose.disconnect();
}

run().catch(console.error);
