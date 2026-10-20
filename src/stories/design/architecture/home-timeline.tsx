import { Figure, Steps } from "../../../story-ui";
import type { StoryMeta } from "../../index";

export const meta: StoryMeta = {
  slug: "twitter-timeline",
  title: "A home timeline, from above",
  date: "Oct 19, 2026",
  published: "2026-10-19",
  minutes: "6 min",
  lede: "The feed looks like one list. Behind it are two separate jobs: store a post once, and assemble what one person sees.",
  sample: true,
};

export default function HomeTimeline() {
  return (
    <>
      <p>
        A new post is stored once. The home timeline does not copy that post for
        every follower. The timeline stores an order of ids. Text, name, and
        image are filled in when the list is shown.
      </p>
      <h2>The write path</h2>
      <p>
        The client calls a write API. The API stores the post, then hands its id
        to fanout. Fanout decides whether that id is pushed into each follower's
        cache, or left to be pulled later.
      </p>
      <Figure caption="Store the post once, then decide how its id reaches a timeline.">
        <Steps items={["Client", "Write API", "Post store", "Fanout"]} />
      </Figure>
      <h2>Two ways to fill the list</h2>
      <p>
        When an account has a countable number of followers, fanout writes the
        id into each follower's timeline cache. When a follower opens the app,
        the list is already there.
      </p>
      <p>
        When an account has millions of followers, writing into every cache is
        too much work. The id is not pushed. When someone opens home, the read
        path merges the cache that was already pushed with a pull from the large
        accounts they follow.
      </p>
      <div className="split">
        <section>
          <h3>Push</h3>
          <p>The follower count is manageable. The id is written into each cache ahead of time.</p>
        </section>
        <section>
          <h3>Pull</h3>
          <p>The follower count is huge. The id is fetched when someone opens home.</p>
        </section>
      </div>
      <h2>The read path</h2>
      <p>
        The app asks for the home timeline. The read service takes the order of
        ids, then fills in each post from storage. The person sees one list.
        The two paths behind it stay hidden.
      </p>
      <Figure caption="Reading merges an order of ids, then fills in the posts.">
        <Steps items={["App", "Read API", "Timeline cache", "Post body"]} />
      </Figure>
      <h2>What this picture leaves out</h2>
      <p>
        Ranking, ads, and moderation change the order of the list. They are
        another layer. They do not change how a post arrives on a timeline.
      </p>
    </>
  );
}
