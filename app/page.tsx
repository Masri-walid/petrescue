import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { NavigationHeader } from "@/components/navigation-header"
import { Heart, Shield, Users, Phone, Camera, Home } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <NavigationHeader />

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <Badge variant="secondary" className="mb-4">
            Connecting Communities for Animal Welfare
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold text-balance mb-6">
            Every Stray Deserves a<span className="text-primary"> Second Chance</span>
          </h1>
          <p className="text-xl text-muted-foreground text-balance mb-8 max-w-2xl mx-auto">
            Join our community-driven platform that connects citizens, shelters, and veterinarians to rescue, care for,
            and find loving homes for stray animals.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/rescue" className="flex items-center gap-2">
                <Camera className="w-5 h-5" />
                Report a Rescue
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/adopt" className="flex items-center gap-2">
                <Home className="w-5 h-5" />
                Find a Pet
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-primary mb-2">2,847</div>
              <div className="text-muted-foreground">Animals Rescued</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary mb-2">1,923</div>
              <div className="text-muted-foreground">Successful Adoptions</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary mb-2">156</div>
              <div className="text-muted-foreground">Partner Shelters</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary mb-2">89</div>
              <div className="text-muted-foreground">Veterinary Partners</div>
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
            <Card>
              <CardHeader>
                <Users className="w-12 h-12 text-primary mb-4" />
                <CardTitle>Citizens</CardTitle>
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
                <Button className="w-full mt-4 bg-transparent" variant="outline" asChild>
                  <Link href="/register?type=citizen">Join as Citizen</Link>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Home className="w-12 h-12 text-primary mb-4" />
                <CardTitle>Shelters & NGOs</CardTitle>
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
                <Button className="w-full mt-4 bg-transparent" variant="outline" asChild>
                  <Link href="/register?type=shelter">Join as Shelter</Link>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Shield className="w-12 h-12 text-primary mb-4" />
                <CardTitle>Veterinarians</CardTitle>
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
                <Button className="w-full mt-4 bg-transparent" variant="outline" asChild>
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
          <Card className="bg-destructive/5 border-destructive/20">
            <CardContent className="p-8 text-center">
              <Phone className="w-12 h-12 text-destructive mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-2">Emergency Animal Rescue</h3>
              <p className="text-muted-foreground mb-4">For severely injured animals requiring immediate attention</p>
              <Button variant="destructive" size="lg">
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
