"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import UserSidebar from "@/components/user-sidebar"
import { FriendList } from "@/components/friend-list"

// Mock data for friends
const mockFriends = [
  {
    id: "1",
    name: "Sarah Johnson",
    username: "sarah_j",
    avatar: "/placeholder.svg?height=40&width=40",
    isOnline: true,
  },
  {
    id: "2",
    name: "Michael Chen",
    username: "mike_c",
    avatar: "/placeholder.svg?height=40&width=40",
    isOnline: false,
  },
  {
    id: "3",
    name: "Jessica Williams",
    username: "jess_w",
    avatar: "/placeholder.svg?height=40&width=40",
    isOnline: true,
  },
  {
    id: "4",
    name: "David Wilson",
    username: "dave_w",
    avatar: "/placeholder.svg?height=40&width=40",
    isOnline: false,
  },
  {
    id: "5",
    name: "Amanda Lee",
    username: "amanda_l",
    avatar: "/placeholder.svg?height=40&width=40",
    isOnline: true,
  },
]

export default function UserProfile() {
  return (
    <div>
      {/* Hero Banner */}
      <div className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Edward kennedy&apos;s profile</h1>
          <div className="flex items-center text-sm">
            <Link href="/" className="hover:text-primary">
              Home
            </Link>
            <span className="mx-2">•</span>
            <span>Profile</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="md:col-span-1">
            <UserSidebar activeItem="profile" />
          </div>

          {/* Main Content */}
          <div className="md:col-span-3">
            <Tabs defaultValue="profile">
              <TabsList className="mb-6">
                <TabsTrigger value="profile">Profile Details</TabsTrigger>
                <TabsTrigger value="password">Password</TabsTrigger>
                <TabsTrigger value="friends">Friends</TabsTrigger>
                <TabsTrigger value="privacy">Privacy Settings</TabsTrigger>
              </TabsList>

              <TabsContent value="profile">
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <form className="space-y-8">
                    <div>
                      <h4 className="text-xl font-bold mb-6">Profile details</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="username">Username</Label>
                          <Input id="username" placeholder="edwardkennedy" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email Address</Label>
                          <Input id="email" type="email" placeholder="edward@kennedy.com" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="firstName">First Name</Label>
                          <Input id="firstName" placeholder="Edward" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="lastName">Last Name</Label>
                          <Input id="lastName" placeholder="Kennedy" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="country">Country</Label>
                          <Select defaultValue="united">
                            <SelectTrigger id="country">
                              <SelectValue placeholder="Select country" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="united">United States</SelectItem>
                              <SelectItem value="canada">Canada</SelectItem>
                              <SelectItem value="uk">United Kingdom</SelectItem>
                              <SelectItem value="australia">Australia</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="state">State</Label>
                          <Select defaultValue="ny">
                            <SelectTrigger id="state">
                              <SelectValue placeholder="Select state" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="ny">New York</SelectItem>
                              <SelectItem value="ca">California</SelectItem>
                              <SelectItem value="tx">Texas</SelectItem>
                              <SelectItem value="fl">Florida</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="mt-4">
                        <Button>Save</Button>
                      </div>
                    </div>
                  </form>
                </div>
              </TabsContent>

              <TabsContent value="password">
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <form className="space-y-8">
                    <div>
                      <h4 className="text-xl font-bold mb-6">Change password</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="oldPassword">Old Password</Label>
                          <Input id="oldPassword" type="password" placeholder="**********" />
                        </div>
                        <div className="md:col-span-2"></div>
                        <div className="space-y-2">
                          <Label htmlFor="newPassword">New Password</Label>
                          <Input id="newPassword" type="password" placeholder="***************" />
                        </div>
                        <div className="md:col-span-2"></div>
                        <div className="space-y-2">
                          <Label htmlFor="confirmPassword">Confirm New Password</Label>
                          <Input id="confirmPassword" type="password" placeholder="***************" />
                        </div>
                      </div>
                      <div className="mt-4">
                        <Button>Change</Button>
                      </div>
                    </div>
                  </form>
                </div>
              </TabsContent>

              <TabsContent value="friends">
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <div>
                    <h4 className="text-xl font-bold mb-6">Friends</h4>
                    <div className="mb-6">
                      <Input placeholder="Search friends..." className="max-w-md" />
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                      <FriendList
                        friends={mockFriends}
                        onRemoveFriend={(id) => console.log(`Remove friend: ${id}`)}
                        onStartChat={(id) => console.log(`Start chat with: ${id}`)}
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="privacy">
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <div>
                    <h4 className="text-xl font-bold mb-6">Privacy Settings</h4>

                    <div className="space-y-6">
                      <div>
                        <h5 className="text-lg font-semibold mb-4">Default Post Privacy</h5>
                        <div className="space-y-4">
                          <div className="flex items-start space-x-3">
                            <input type="radio" id="public" name="default-privacy" className="mt-1" defaultChecked />
                            <div>
                              <Label htmlFor="public" className="font-medium">
                                Public
                              </Label>
                              <p className="text-sm text-muted-foreground">Anyone can see your posts</p>
                            </div>
                          </div>
                          <div className="flex items-start space-x-3">
                            <input type="radio" id="friends" name="default-privacy" className="mt-1" />
                            <div>
                              <Label htmlFor="friends" className="font-medium">
                                Friends Only
                              </Label>
                              <p className="text-sm text-muted-foreground">Only your friends can see your posts</p>
                            </div>
                          </div>
                          <div className="flex items-start space-x-3">
                            <input type="radio" id="private" name="default-privacy" className="mt-1" />
                            <div>
                              <Label htmlFor="private" className="font-medium">
                                Private
                              </Label>
                              <p className="text-sm text-muted-foreground">Only you can see your posts</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h5 className="text-lg font-semibold mb-4">Profile Visibility</h5>
                        <div className="space-y-4">
                          <div className="flex items-start space-x-3">
                            <input
                              type="radio"
                              id="profile-public"
                              name="profile-privacy"
                              className="mt-1"
                              defaultChecked
                            />
                            <div>
                              <Label htmlFor="profile-public" className="font-medium">
                                Public
                              </Label>
                              <p className="text-sm text-muted-foreground">Anyone can view your profile</p>
                            </div>
                          </div>
                          <div className="flex items-start space-x-3">
                            <input type="radio" id="profile-friends" name="profile-privacy" className="mt-1" />
                            <div>
                              <Label htmlFor="profile-friends" className="font-medium">
                                Friends Only
                              </Label>
                              <p className="text-sm text-muted-foreground">Only your friends can view your profile</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h5 className="text-lg font-semibold mb-4">Friend Requests</h5>
                        <div className="space-y-4">
                          <div className="flex items-start space-x-3">
                            <input
                              type="radio"
                              id="requests-everyone"
                              name="friend-requests"
                              className="mt-1"
                              defaultChecked
                            />
                            <div>
                              <Label htmlFor="requests-everyone" className="font-medium">
                                Everyone
                              </Label>
                              <p className="text-sm text-muted-foreground">Anyone can send you friend requests</p>
                            </div>
                          </div>
                          <div className="flex items-start space-x-3">
                            <input
                              type="radio"
                              id="requests-friends-of-friends"
                              name="friend-requests"
                              className="mt-1"
                            />
                            <div>
                              <Label htmlFor="requests-friends-of-friends" className="font-medium">
                                Friends of Friends
                              </Label>
                              <p className="text-sm text-muted-foreground">
                                Only friends of your friends can send you requests
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6">
                      <Button>Save Privacy Settings</Button>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}
