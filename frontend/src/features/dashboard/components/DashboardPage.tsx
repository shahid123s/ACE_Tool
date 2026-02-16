import Card, { CardHeader, CardContent } from '@/components/ui/Card';

export default function DashboardPage() {
    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Dashboard</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card>
                    <CardHeader>
                        <h2 className="text-xl font-semibold">Total Users</h2>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold text-blue-600">1,234</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <h2 className="text-xl font-semibold">Active Sessions</h2>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold text-green-600">256</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <h2 className="text-xl font-semibold">Revenue</h2>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold text-purple-600">$45,678</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
