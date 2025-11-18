import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { NavigationHeader } from "@/components/navigation-header"
import { AnimatedCounter } from "@/components/animated-counter"

import { Heart, Shield, Users, Phone, Camera, Home } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <NavigationHeader />

      {/* Hero Section */}
      <section className="py-20 px-4 relative overflow-hidden bg-gradient-to-br from-background via-blue-50/30 to-purple-50/30 dark:from-background dark:via-blue-950/10 dark:to-purple-950/10">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-green-400/20 to-blue-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="container mx-auto text-center max-w-4xl relative z-10">
          <Badge variant="secondary" className="mb-4 animate-fade-in bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/50 dark:to-purple-900/50 border-blue-200 dark:border-blue-800">
            Connecting Communities for Animal Welfare
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold text-balance mb-6 animate-fade-in-delay bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 dark:from-white dark:via-blue-200 dark:to-purple-200 bg-clip-text text-transparent">
            Every Stray Deserves a<span className="text-primary"> Second Chance</span>
          </h1>
          <p className="text-xl text-muted-foreground text-balance mb-8 max-w-2xl mx-auto animate-fade-in-delay-2">
            Join our community-driven platform that connects citizens, shelters, and veterinarians to rescue, care for,
            and find loving homes for stray animals.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-delay-3">
            <Button size="lg" className="shadow-lg" asChild>
              <Link href="/rescue" className="flex items-center gap-2">
                <Camera className="w-5 h-5" />
                Report a Rescue
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="border-2" asChild>
              <Link href="/adopt" className="flex items-center gap-2">
                <Home className="w-5 h-5" />
                Find a Pet
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-blue-950/20 dark:via-purple-950/20 dark:to-pink-950/20">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="rounded-2xl p-6 shadow-lg">
                <AnimatedCounter
                  end={2847}
                  className="text-3xl font-bold mb-2"
                  duration={2500}
                />
                <div className="font-medium">Animals Rescued</div>
              </div>
            </div>
            <div>
              <div className="rounded-2xl p-6 shadow-lg">
                <AnimatedCounter
                  end={1923}
                  className="text-3xl font-bold mb-2"
                  duration={2200}
                />
                <div className="font-medium">Successful Adoptions</div>
              </div>
            </div>
            <div>
              <div className="rounded-2xl p-6 shadow-lg">
                <AnimatedCounter
                  end={156}
                  className="text-3xl font-bold mb-2"
                  duration={1800}
                />
                <div className="font-medium">Partner Shelters</div>
              </div>
            </div>
            <div>
              <div className="rounded-2xl p-6 shadow-lg">
                <AnimatedCounter
                  end={89}
                  className="text-3xl font-bold mb-2"
                  duration={1500}
                />
                <div className="font-medium">Veterinary Partners</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How PetRescue Connect Works</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Our streamlined process makes it easy to help animals in need
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardHeader>
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Camera className="w-8 h-8 text-primary" />
                </div>
                <CardTitle>1. Report & Locate</CardTitle>
                <CardDescription>
                  Spot a stray animal? Take a photo and share the location. Our system instantly notifies nearby
                  shelters and volunteers.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-primary" />
                </div>
                <CardTitle>2. Rescue & Care</CardTitle>
                <CardDescription>
                  Trained volunteers and veterinarians respond quickly to provide medical care and safe shelter for
                  rescued animals.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-8 h-8 text-primary" />
                </div>
                <CardTitle>3. Adopt & Love</CardTitle>
                <CardDescription>
                  Once healthy, animals are listed for adoption. Families can browse, apply, and welcome a new member
                  home.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* User Types */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Join Our Community</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Whether you're a concerned citizen, shelter worker, or veterinarian, there's a place for you
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="hover-lift border-2 hover:border-blue-200 dark:hover:border-blue-800 transition-all duration-300 group">
              <CardHeader>
                <Users className="w-12 h-12 text-primary mb-4 group-hover:scale-110 transition-transform duration-300" />
                <CardTitle className="group-hover:text-blue-600 transition-colors duration-300">Citizens</CardTitle>
                <CardDescription>
                  Be the eyes and ears of your community. Report stray animals and help connect them with care.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Quick photo reporting</li>
                  <li>• GPS location sharing</li>
                  <li>• Track rescue progress</li>
                  <li>• Browse adoptable pets</li>
                </ul>
                <Button className="w-full mt-4 bg-transparent hover:bg-blue-50 dark:hover:bg-blue-950/20 border-blue-200 hover:border-blue-300 transition-all duration-300" variant="outline" asChild>
                  <Link href="/register?type=citizen">Join as Citizen</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="hover-lift border-2 hover:border-green-200 dark:hover:border-green-800 transition-all duration-300 group">
              <CardHeader>
                <Home className="w-12 h-12 text-primary mb-4 group-hover:scale-110 transition-transform duration-300" />
                <CardTitle className="group-hover:text-green-600 transition-colors duration-300">Shelters & NGOs</CardTitle>
                <CardDescription>
                  Manage your rescue operations, track animal health, and streamline the adoption process.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Rescue dispatch system</li>
                  <li>• Animal health tracking</li>
                  <li>• Adoption management</li>
                  <li>• Volunteer coordination</li>
                </ul>
                <Button className="w-full mt-4 bg-transparent hover:bg-green-50 dark:hover:bg-green-950/20 border-green-200 hover:border-green-300 transition-all duration-300" variant="outline" asChild>
                  <Link href="/register?type=shelter">Join as Shelter</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="hover-lift border-2 hover:border-purple-200 dark:hover:border-purple-800 transition-all duration-300 group">
              <CardHeader>
                <Shield className="w-12 h-12 text-primary mb-4 group-hover:scale-110 transition-transform duration-300" />
                <CardTitle className="group-hover:text-purple-600 transition-colors duration-300">Veterinarians</CardTitle>
                <CardDescription>
                  Provide medical expertise, track treatments, and ensure animals are healthy for adoption.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Medical record management</li>
                  <li>• Treatment scheduling</li>
                  <li>• Health certifications</li>
                  <li>• Emergency response</li>
                </ul>
                <Button className="w-full mt-4 bg-transparent hover:bg-purple-50 dark:hover:bg-purple-950/20 border-purple-200 hover:border-purple-300 transition-all duration-300" variant="outline" asChild>
                  <Link href="/register?type=vet">Join as Veterinarian</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Emergency Contact */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <Card className="bg-red-50 border-red-200 shadow-lg">
            <CardContent className="p-8 text-center">
              <Phone className="w-12 h-12 text-red-600 mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-2 text-red-800">Emergency Animal Rescue</h3>
              <p className="text-red-700 mb-4 font-medium">For severely injured animals requiring immediate attention</p>
              <Button className="btn-emergency" size="lg">
                Call Emergency Hotline: 1-800-RESCUE
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t py-12 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Heart className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="text-xl font-bold">PetRescue Connect</span>
              </div>
              <p className="text-muted-foreground text-sm">
                Connecting communities to save lives, one rescue at a time.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">For Citizens</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/rescue" className="hover:text-foreground">
                    Report Rescue
                  </Link>
                </li>
                <li>
                  <Link href="/adopt" className="hover:text-foreground">
                    Adopt a Pet
                  </Link>
                </li>
                <li>
                  <Link href="/volunteer" className="hover:text-foreground">
                    Volunteer
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">For Organizations</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/shelter-dashboard" className="hover:text-foreground">
                    Shelter Dashboard
                  </Link>
                </li>
                <li>
                  <Link href="/vet-portal" className="hover:text-foreground">
                    Vet Portal
                  </Link>
                </li>
                <li>
                  <Link href="/partner" className="hover:text-foreground">
                    Become a Partner
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/help" className="hover:text-foreground">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-foreground">
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="hover:text-foreground">
                    Privacy Policy
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2025 PetRescue Connect. Made with ❤️ for animals in need.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
