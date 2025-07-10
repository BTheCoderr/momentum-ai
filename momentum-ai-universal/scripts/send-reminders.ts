import { supabase } from '../lib/supabase';
import { sendSmartReminder } from '../lib/notifications';

async function sendReminders() {
  try {
    // Get all users with push tokens
    const { data: users, error } = await supabase
      .from('profiles')
      .select('id, push_token')
      .not('push_token', 'is', null);

    if (error) throw error;

    console.log(`Sending reminders to ${users.length} users...`);

    // Send reminders in parallel, but with a small delay to avoid rate limits
    await Promise.all(users.map((user, index) => 
      new Promise(resolve => 
        setTimeout(() => {
          sendSmartReminder(user.id).then(resolve);
        }, index * 1000) // 1 second delay between each user
      )
    ));

    console.log('Finished sending reminders!');
  } catch (error) {
    console.error('Error in reminder script:', error);
  } finally {
    process.exit(0);
  }
}

// Run the script
sendReminders(); 