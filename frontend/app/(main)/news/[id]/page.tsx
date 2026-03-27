import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Facebook, Twitter, Linkedin } from "lucide-react"

export default function BlogDetail({ params }: { params: { id: string } }) {
  // In a real app, you would fetch blog data based on the ID
  const blog = {
    id: params.id,
    title: "New Character Posters For Pirates Of The Caribbean",
    date: "27 Mar 2017",
    image: "/placeholder.svg?height=400&width=800",
    content: [
      "Joss Whedon has a little bit of a history with superhero movies, and for creating layered female characters. After his documented frustrations with Wonder Woman, he's getting another chance at the DC Extended Universe and Warner Bros., closing in on a deal to write direct and produce a Batgirl movie.",
      "It's a somewhat surprising, but welcome move, given that Whedon has taken a long break to write something original, but has now pivoted to focus on developing the Batgirl project. First appearing in 1967 in Gardner Fox and Carmine Infantino's story run The Million Dollar Debut Of Batgirl, she's the superhero alias of Barbara Gordon, daughter of Gotham City Police Commissioner James Gordon. So we can likely expect J.K. Simmons' take on Gordon to appear along with other Bat-related characters.",
      'Based on Lissa Evans\' novel "Their Finest Hour and a Half" and directed by Lone Scherfig ("An Education"), the film is set in London during World War II when the British ministry was utilizing propaganda films to boost morale. Arterton plays Catrin Cole, a scriptwriter who is brought on to handle the women\'s dialogue — commonly referred to as "the nausea." The film, opening this week, features an outstanding ensemble, including Bill Nighy as a washed-up actor and Sam Claflin as Catrin\'s fellow writer and sparring partner.',
    ],
    tags: ["Gray", "Film", "Poster"],
    comments: [
      {
        id: 1,
        author: "Steve Perry",
        date: "27 Mar 2017",
        avatar: "/placeholder.svg?height=50&width=50",
        content:
          "Even though Journey's classic vocalist Steve Perry didn't reunite with the band during their Rock Hall performance (to the dismay of hopeful fans), he did offer up a touching speech.",
      },
      {
        id: 2,
        author: "Joss Whedon",
        date: "27 Mar 2017",
        avatar: "/placeholder.svg?height=50&width=50",
        content:
          "Prince died not long after the 2016 Rock Hall ceremony, so this year's edition featured Lenny Kravitz and a full gospel choir performing a swamp-funk take on When Doves Cry.",
        isReply: true,
      },
      {
        id: 3,
        author: "Dave McNary",
        date: "27 Mar 2017",
        avatar: "/placeholder.svg?height=50&width=50",
        content:
          "Blue Sky Studios is one of the world's leading digital animation movie studios and we are proud of their commitment to stay and grow in Connecticut.",
        isReply: true,
      },
      {
        id: 4,
        author: "Margot Robbie",
        date: "27 Mar 2017",
        avatar: "/placeholder.svg?height=50&width=50",
        content:
          "Joan Baez was the sharpest of the Rock Hall inductees, singing about deportees and talking social activism as well as joking about her age and the likelihood that a good portion of the Barclays.",
      },
    ],
  }

  return (
    <div>
      {/* Hero Banner */}
      <div className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Blog Detail</h1>
          <div className="flex items-center text-sm">
            <Link href="/" className="hover:text-primary">
              Home
            </Link>
            <span className="mx-2">•</span>
            <span>Blog Listing</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="md:col-span-2">
            <article className="bg-white rounded-lg shadow-lg p-6">
              <h1 className="text-2xl md:text-3xl font-bold mb-2">{blog.title}</h1>
              <p className="text-sm text-muted-foreground mb-6">{blog.date}</p>

              <Image
                src={blog.image || "/placeholder.svg"}
                alt={blog.title}
                width={800}
                height={400}
                className="rounded-lg mb-6 w-full h-auto"
              />

              <div className="space-y-4 mb-8">
                {blog.content.map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>

              <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-t border-b py-4 mb-8">
                <div>
                  <h4 className="font-medium mb-2">Share it</h4>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" className="rounded-full">
                      <Facebook className="h-5 w-5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="rounded-full">
                      <Twitter className="h-5 w-5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="rounded-full">
                      <Linkedin className="h-5 w-5" />
                    </Button>
                  </div>
                </div>

                <div className="mt-4 md:mt-0">
                  <h4 className="font-medium mb-2">Tags</h4>
                  <div className="flex gap-1">
                    {blog.tags.map((tag, index) => (
                      <Link key={index} href="#" className="hover:text-primary">
                        {tag}
                        {index < blog.tags.length - 1 ? ", " : ""}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

              {/* Comments */}
              <div>
                <h4 className="text-xl font-bold mb-6">04 Comments</h4>

                <div className="space-y-6">
                  {blog.comments.map((comment) => (
                    <div
                      key={comment.id}
                      className={`flex gap-4 ${comment.isReply ? "ml-12" : ""} ${comment.id < blog.comments.length ? "pb-6 border-b" : ""}`}
                    >
                      <Image
                        src={comment.avatar || "/placeholder.svg"}
                        alt={comment.author}
                        width={50}
                        height={50}
                        className="rounded-full h-12 w-12"
                      />
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h6 className="font-medium">
                            <Link href="#" className="hover:text-primary">
                              {comment.author}
                            </Link>
                          </h6>
                          <span className="text-sm text-muted-foreground">- {comment.date}</span>
                        </div>
                        <p className="text-sm mb-2">{comment.content}</p>
                        {!comment.isReply && (
                          <Button variant="link" className="p-0 h-auto text-sm text-primary">
                            + Reply
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Comment Form */}
              <div className="mt-8">
                <h4 className="text-xl font-bold mb-6">Leave a comment</h4>

                <form className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <input type="text" placeholder="Your name" className="w-full p-2 border rounded" />
                    </div>
                    <div>
                      <input type="email" placeholder="Your email" className="w-full p-2 border rounded" />
                    </div>
                    <div>
                      <input type="text" placeholder="Website" className="w-full p-2 border rounded" />
                    </div>
                  </div>

                  <div>
                    <textarea placeholder="Message" rows={5} className="w-full p-2 border rounded"></textarea>
                  </div>

                  <Button type="submit">Submit</Button>
                </form>
              </div>
            </article>
          </div>

          {/* Sidebar */}
          <div className="md:col-span-1">
            <div className="space-y-8">
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h4 className="text-lg font-bold mb-4">Search</h4>
                <input type="text" placeholder="Enter keywords" className="w-full p-2 border rounded" />
              </div>

              <div className="bg-white rounded-lg shadow-lg p-6">
                <h4 className="text-lg font-bold mb-4">Categories</h4>
                <ul className="space-y-2">
                  <li>
                    <Link href="#" className="hover:text-primary">
                      Awards (50)
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="hover:text-primary">
                      Box office (38)
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="hover:text-primary">
                      Film reviews (72)
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="hover:text-primary">
                      News (45)
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="hover:text-primary">
                      Global (06)
                    </Link>
                  </li>
                </ul>
              </div>

              <div className="bg-white rounded-lg shadow-lg p-6">
                <h4 className="text-lg font-bold mb-4">Most Popular</h4>
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <span className="text-lg font-bold">01</span>
                    <h6 className="text-sm">
                      <Link href="#" className="hover:text-primary">
                        Korea Box Office: Beauty and the Beast Wins Fourth
                      </Link>
                    </h6>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-lg font-bold">02</span>
                    <h6 className="text-sm">
                      <Link href="#" className="hover:text-primary">
                        Homeland Finale Includes Shocking Death
                      </Link>
                    </h6>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-lg font-bold">03</span>
                    <h6 className="text-sm">
                      <Link href="#" className="hover:text-primary">
                        Fate of the Furious Reviews What the Critics Saying
                      </Link>
                    </h6>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-lg p-6">
                <h4 className="text-lg font-bold mb-4">Tags</h4>
                <div className="flex flex-wrap gap-2">
                  <Link href="#" className="px-3 py-1 bg-gray-100 rounded hover:bg-gray-200">
                    Batman
                  </Link>
                  <Link href="#" className="px-3 py-1 bg-gray-100 rounded hover:bg-gray-200">
                    film
                  </Link>
                  <Link href="#" className="px-3 py-1 bg-gray-100 rounded hover:bg-gray-200">
                    homeland
                  </Link>
                  <Link href="#" className="px-3 py-1 bg-gray-100 rounded hover:bg-gray-200">
                    Fast & Furious
                  </Link>
                  <Link href="#" className="px-3 py-1 bg-gray-100 rounded hover:bg-gray-200">
                    Dead Walker
                  </Link>
                  <Link href="#" className="px-3 py-1 bg-gray-100 rounded hover:bg-gray-200">
                    King
                  </Link>
                  <Link href="#" className="px-3 py-1 bg-gray-100 rounded hover:bg-gray-200">
                    Beauty
                  </Link>
                </div>
              </div>

              <div>
                <Image
                  src="/placeholder.svg?height=250&width=300"
                  alt="Advertisement"
                  width={300}
                  height={250}
                  className="w-full h-auto"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
