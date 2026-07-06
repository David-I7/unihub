# Main domain tables use UUID primary keys

UniHub uses UUID primary keys for main domain tables such as users, series, courses, materials, professors, activities, and notification subscriptions. UUIDs are safe to expose in APIs and avoid coupling clients to sequential database row counts.

